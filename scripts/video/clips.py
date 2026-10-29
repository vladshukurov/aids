"""Product clips of the re:verse DS process, in pipeline order, plus one hero.

    python3 scripts/video/clips.py <shots dir> <frames dir> [clip ...]
    swift scripts/video/encode.swift <frames dir>/<clip> docs/video/<clip>.mp4

<shots dir>: 2x PNG exports of the golden screens (download_assets, scale 2).
Clips (4:3, no titles, each fits a card): 01-ask → 02-spec-to-screen → 03-flow → 04-switch → 05-library.
hero: 16:9 headliner. Preview single frames with ONLY=30,120.
Motion is subpixel (affine transforms from mipmaps), text is drawn at 2x, shadows are two soft layers.
"""
import math, os, re, sys
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

FPS = 30
BG = (244, 244, 242)
INK, GREY, MUTE = (22, 22, 20), (128, 128, 124), (178, 178, 174)
SHOTS, OUT = sys.argv[1], sys.argv[2]
SANS = '/Library/Fonts/SF-Pro-Display-Regular.otf'
MONO = '/System/Library/Fonts/SFNSMono.ttf'
_fonts = {}
def font(path, size, var=None):
    k = (path, size, var)
    if k not in _fonts:
        f = ImageFont.truetype(path, size)
        if var: f.set_variation_by_name(var)
        _fonts[k] = f
    return _fonts[k]

# ---------- time ----------
def clamp(x, a=0.0, b=1.0): return max(a, min(b, x))
def lerp(a, b, k): return a + (b - a) * k
def phase(t, start, dur): return clamp((t - start) / dur)
def out4(t): t = clamp(t); return 1 - (1 - t) ** 4
def inout(t): t = clamp(t); return 4 * t ** 3 if t < .5 else 1 - (-2 * t + 2) ** 3 / 2
def sine(t): t = clamp(t); return 0.5 - 0.5 * math.cos(math.pi * t)
ONLY = [int(x) for x in os.environ.get('ONLY', '').split(',') if x]
def frames(n): return [i for i in ONLY if i < n] if ONLY else range(n)

# ---------- sprites: subpixel placement from mipmaps ----------
class Sprite:
    def __init__(self, img): self.mips = [img.convert('RGBA')]
    def _mip(self, scale):
        i, f = 0, scale
        while f < 0.5 and self.mips[i].width > 8:
            if len(self.mips) == i + 1:
                p = self.mips[i]; self.mips.append(p.resize((max(1, p.width // 2), max(1, p.height // 2)), Image.LANCZOS))
            i += 1; f = scale * self.mips[0].width / self.mips[i].width
        return self.mips[i], f
    def draw(self, canvas, cx, cy, scale, alpha=1.0):
        if alpha <= 0.003 or scale <= 0: return
        img, f = self._mip(scale)
        w, h = img.width * f, img.height * f
        x0, y0 = cx - w / 2, cy - h / 2
        cx0, cy0 = max(0, math.floor(x0)), max(0, math.floor(y0))
        cx1, cy1 = min(canvas.width, math.ceil(x0 + w) + 1), min(canvas.height, math.ceil(y0 + h) + 1)
        if cx1 <= cx0 or cy1 <= cy0: return
        out = img.transform((cx1 - cx0, cy1 - cy0), Image.AFFINE, (1 / f, 0, (cx0 - x0) / f, 0, 1 / f, (cy0 - y0) / f), resample=Image.BICUBIC)
        if alpha < 0.997: out.putalpha(out.getchannel('A').point(lambda a: int(a * alpha)))
        canvas.alpha_composite(out, (cx0, cy0))

_masks = {}
def rounded(img, r):
    """Antialiased rounded corners; the mask is drawn at 4x once per size."""
    w, h = img.size
    if (w, h, r) not in _masks:
        m = Image.new('L', (w * 4, h * 4), 0); ImageDraw.Draw(m).rounded_rectangle([0, 0, w * 4 - 1, h * 4 - 1], r * 4, fill=255)
        _masks[(w, h, r)] = m.resize((w, h), Image.LANCZOS)
    out = img.convert('RGBA'); out.putalpha(_masks[(w, h, r)]); return out

def add_alpha(*layers):
    return Image.fromarray(np.clip(sum(np.asarray(l, dtype=np.uint16) for l in layers), 0, 255).astype('uint8'))

_shadows = {}
def soft_shadow(w, h, r):
    """Wide ambient layer + close contact layer, built at quarter resolution (it is all blur anyway)."""
    if (w, h, r) not in _shadows:
        q, pad = 4, 70; W2, H2, R2 = w // q, h // q, r // q
        amb = Image.new('L', (W2 + pad * 2, H2 + pad * 2), 0)
        ImageDraw.Draw(amb).rounded_rectangle([pad, pad + 9, pad + W2, pad + H2 + 9], R2, fill=34)
        con = Image.new('L', amb.size, 0)
        ImageDraw.Draw(con).rounded_rectangle([pad + 1, pad + 1, pad + W2 - 1, pad + H2 + 1], R2, fill=22)
        layer = Image.new('RGBA', amb.size, (30, 30, 26, 0))
        layer.putalpha(add_alpha(amb.filter(ImageFilter.GaussianBlur(22)), con.filter(ImageFilter.GaussianBlur(4))))
        _shadows[(w, h, r)] = (Sprite(layer), q)
    return _shadows[(w, h, r)]

class Phone:
    """A screen (2x export viewport) with rounded corners, a hairline and a soft shadow."""
    def __init__(self, screen2x):
        w, h = screen2x.size
        img = rounded(screen2x, 92)
        ImageDraw.Draw(img).rounded_rectangle([0, 0, w - 1, h - 1], 92, outline=(0, 0, 0, 14), width=2)
        self.sprite = Sprite(img); self.shadow, self.sq = soft_shadow(w, h, 92)
    def draw(self, canvas, cx, cy, scale, alpha=1.0, shadow=1.0):
        """scale = on-screen width / 402 (the logical screen width)."""
        k = scale / 2
        self.shadow.draw(canvas, cx, cy + 4 * scale, k * self.sq, alpha * shadow)
        self.sprite.draw(canvas, cx, cy, k, alpha)

# ---------- screens ----------
_shots = {}
def shot(name):
    if name not in _shots: _shots[name] = Image.open(os.path.join(SHOTS, name + '.png')).convert('RGB')
    return _shots[name]
PIN = {'profile': 1262, 'profile-atlas': 1262, 'account': 940, 'c1': 1012, 'c4': 934}
_bands = {}
def _band(sw, hpx, down):
    if (sw, hpx, down) not in _bands:
        m = Image.new('L', (sw, hpx), 0); d = ImageDraw.Draw(m)
        for i in range(hpx): d.line([(0, i), (sw, i)], fill=int(255 * ((1 - i / hpx) if down else i / hpx) ** 1.4))
        _bands[(sw, hpx, down)] = m
    return _bands[(sw, hpx, down)]
def viewport(name, scroll=0.0, pin_top=62):
    """402×874 device viewport (2x) of a long screen: content scrolled, status bar and bottom chat pinned."""
    s = shot(name); sw, sh = s.size; k = sw / 402; vh = int(874 * k)
    y0 = int(round(scroll * k)); v = s.crop((0, y0, sw, y0 + vh))
    if scroll > 0 and pin_top:
        v.paste(s.crop((0, 0, sw, int(pin_top * k))), (0, 0)); v.paste((255, 255, 255), (0, int(pin_top * k)), _band(sw, int(30 * k), True))
    pb = PIN.get(name)
    if pb is not None and sh > vh:
        chat = s.crop((0, int(pb * k), sw, sh)); top = vh - chat.height
        v.paste((255, 255, 255), (0, top - int(60 * k)), _band(sw, int(60 * k), False)); v.paste(chat, (0, top))
    return v

def canvas(w, h): return Image.new('RGBA', (w, h), BG + (255,))
def save(c, clip, i):
    d = os.path.join(OUT, clip); os.makedirs(d, exist_ok=True)
    c.convert('RGB').save(os.path.join(d, f'{i:05d}.png'), compress_level=1)

# ---------- 2x cards ----------
_cards = {}
def card(w, h, r=36):
    """White card at 2x with a soft two-layer shadow. Returns (image copy, pad). Draw it at scale 0.5."""
    if (w, h, r) not in _cards:
        W2, H2, R2, pad = w * 2, h * 2, r * 2, 120
        img = Image.new('RGBA', (W2 + pad * 2, H2 + pad * 2), (0, 0, 0, 0))
        amb = Image.new('L', img.size, 0); ImageDraw.Draw(amb).rounded_rectangle([pad, pad + 30, pad + W2, pad + H2 + 30], R2, fill=30)
        con = Image.new('L', img.size, 0); ImageDraw.Draw(con).rounded_rectangle([pad, pad + 3, pad + W2, pad + H2 + 3], R2, fill=18)
        sh = Image.new('RGBA', img.size, (30, 30, 26, 0)); sh.putalpha(add_alpha(amb.filter(ImageFilter.GaussianBlur(52)), con.filter(ImageFilter.GaussianBlur(7))))
        img.alpha_composite(sh); img.alpha_composite(rounded(Image.new('RGB', (W2, H2), (255, 255, 255)), R2), (pad, pad))
        _cards[(w, h, r)] = (img, pad)
    img, pad = _cards[(w, h, r)]
    return img.copy(), pad

def tokens(d, x, ym, text, f, alpha=255):
    """JSON with quiet colouring: keys grey, values ink, punctuation light; ym is the line's middle."""
    for p in re.split(r'("[^"]*"\s*:|"[^"]*")', text):
        if not p: continue
        col = GREY if p.rstrip().endswith(':') else INK if p.startswith('"') else MUTE
        d.text((x, ym), p, font=f, fill=col + (alpha,), anchor='lm'); x += d.textlength(p, font=f)

def send_button(d, bx, by, br):
    d.ellipse([bx - br, by - br, bx + br, by + br], fill=INK + (255,))
    s = br * 0.38
    d.line([(bx, by + s), (bx, by - s)], fill=(255, 255, 255, 255), width=5)
    d.line([(bx - s * 0.86, by - s * 0.12), (bx, by - s), (bx + s * 0.86, by - s * 0.12)], fill=(255, 255, 255, 255), width=5, joint='curve')

# ---------- 01 · ask: the request, the agent thinking, ready ----------
PROMPT = 'Собери экран профиля: данные, безопасность, настройки'
STEPS = [
    ('Читаю правила продукта', 'AGENTS.md'),
    ('Выбираю рецепт', 'recipes/profile.md'),
    ('Планирую экран', 'объект · герой · 3 секции'),
    ('Беру данные Алекса', 'foundations/persona.md'),
    ('Пишу спеку', 'specs/work/profile.json'),
    ('Проверяю правила', 'линтер · 0 ошибок'),
    ('Собираю в Figma', 'рендерер · лог пуст'),
    ('Аудит экрана', '0 ошибок'),
]
def glyph(d, cx, cy, r, t, done):
    """Thinking: a rotating arc that settles into a check."""
    if done < 1:
        a = (t * 420) % 360
        d.arc([cx - r, cy - r, cx + r, cy + r], a, a + 250, fill=MUTE + (int(255 * (1 - done)),), width=5)
    if done > 0:
        k = out4(done); d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=INK + (int(255 * k),))
        d.line([(cx - r * .42, cy + r * .02), (cx - r * .1, cy + r * .34), (cx + r * .45, cy - r * .3)], fill=(255, 255, 255, int(255 * k)), width=5, joint='curve')

def shimmer(img, x, ym, text, f, t, alpha):
    """A light sweep across the active label, like a model thinking."""
    tw = int(ImageDraw.Draw(img).textlength(text, font=f)) + 6; hh = 80
    m = Image.new('L', (tw, hh), 0); ImageDraw.Draw(m).text((0, hh / 2), text, font=f, fill=255, anchor='lm')
    xs = np.arange(tw); pos = ((t * 0.9) % 1.0) * (tw + 360) - 180
    band = np.tile((np.exp(-((xs - pos) / 110.0) ** 2) * 255 * alpha / 255).astype(np.uint16), (hh, 1))
    mm = Image.fromarray((np.asarray(m, dtype=np.uint16) * band // 255).astype('uint8'))
    img.paste(INK + (255,), (int(x), int(ym - hh / 2)), mm)

THUMB = None
def clip_ask():
    global THUMB
    THUMB = viewport('profile').resize((56, 122), Image.LANCZOS)
    W, H = 1440, 1080; N = int(12 * FPS); PW, PH = 1000, 780
    fS, fSm, fM = font(SANS, 54), font(SANS, 52), font(MONO, 36, 'Regular')
    for i in frames(N):
        t = i / FPS; c = canvas(W, H)
        img, pad = card(PW, PH); d = ImageDraw.Draw(img); X0, Y0 = pad, pad
        ix, iw, ih = X0 + 48, PW * 2 - 96, 124; iy = Y0 + PH * 2 - 48 - ih
        d.rounded_rectangle([ix, iy, ix + iw, iy + ih], ih // 2, fill=(244, 244, 241, 255))
        sent = phase(t, 3.3, 0.6)
        n = int(len(PROMPT) * phase(t, 0.6, 2.4))
        if sent <= 0 and n:
            d.text((ix + 48, iy + ih / 2), PROMPT[:n], font=fS, fill=INK + (255,), anchor='lm')
            if t < 3.2 and int(t * 2.4) % 2 == 0:
                x_ = ix + 48 + d.textlength(PROMPT[:n], font=fS) + 4; d.line([(x_, iy + 36), (x_, iy + ih - 36)], fill=INK + (255,), width=4)
        else:
            d.text((ix + 48, iy + ih / 2), 'Что собрать?', font=fS, fill=MUTE + (int(255 * (1 if n == 0 else out4(sent))),), anchor='lm')
        send_button(d, ix + iw - 64, iy + ih / 2, 42 - 6 * math.sin(math.pi * phase(t, 3.15, 0.3)))
        if sent > 0:   # the request flies up into a bubble
            k = out4(sent); fB = font(SANS, 46); tw = d.textlength(PROMPT, font=fB); bw, bh = tw + 76, 100
            bx0 = X0 + PW * 2 - 48 - bw; by0 = lerp(iy - 30, Y0 + 52, k)
            d.rounded_rectangle([bx0, by0, bx0 + bw, by0 + bh], bh // 2, fill=(240, 240, 237, int(255 * k)))
            d.text((bx0 + 38, by0 + bh / 2), PROMPT, font=fB, fill=INK + (int(255 * k),), anchor='lm')
        y = Y0 + 52 + 100 + 92
        for j, (label, detail) in enumerate(STEPS):
            st = 4.0 + j * 0.74; k = out4(phase(t, st, 0.5))
            if k <= 0: break
            done = phase(t, st + 0.62, 0.3); ym = y + j * 88 + (1 - k) * 16; a = int(255 * k)
            glyph(d, X0 + 84, ym, 20, t, done)
            lx = X0 + 138
            d.text((lx, ym), label, font=fSm, fill=(INK if done >= 1 else GREY) + (a,), anchor='lm')
            if done < 1: shimmer(img, lx, ym, label, fSm, t, a)
            d.text((lx + d.textlength(label, font=fSm) + 30, ym + 1), detail, font=fM, fill=(158, 158, 154) + (a,), anchor='lm')
        # the result: the built screen as an attachment in the answer
        rk = out4(phase(t, 10.1, 0.7))
        if rk > 0:
            ry = y + len(STEPS) * 88 + 8 + (1 - rk) * 20; rx = X0 + 64; rw, rh = 760, 150
            d.rounded_rectangle([rx, ry, rx + rw, ry + rh], 30, fill=(246, 246, 243, int(255 * rk)))
            thumb = rounded(THUMB, 12); ImageDraw.Draw(thumb).rounded_rectangle([0, 0, thumb.width - 1, thumb.height - 1], 12, outline=(0, 0, 0, 34), width=2)
            thumb.putalpha(thumb.getchannel('A').point(lambda v: int(v * rk)))
            img.alpha_composite(thumb, (int(rx + 22), int(ry + 14)))
            d.text((rx + 140, ry + 54), 'Profile', font=fSm, fill=INK + (int(255 * rk),), anchor='lm')
            d.text((rx + 140, ry + 104), 'Polygon · аудит 0 ошибок', font=fM, fill=(158, 158, 154, int(255 * rk)), anchor='lm')
        Sprite(img).draw(c, W / 2, H / 2 + 6, 0.5)
        save(c, '01-ask', i)

# ---------- 02 · spec to screen ----------
SPEC = [
    ('{', 0), ('"archetype": "object",', 1), ('"topbar": { "back": true },', 1), ('"body": [', 1),
    ('{ "hero": "person", "name": "Alex Morgan" },', 2),
    ('{ "group": "Personal details", "rows": [', 2),
    ('{ "title": "Phone", "avatar": { "icon": "phone" } },', 3),
    ('{ "title": "Email", "avatar": { "icon": "envelope" } },', 3),
    ('{ "title": "Address", "avatar": { "icon": "house" } } ] },', 3),
    ('{ "group": "Security", "rows": [', 2),
    ('{ "title": "Face ID", "toggle": true },', 3),
    ('{ "title": "Passcode", "avatar": { "icon": "lock" } },', 3),
    ('{ "title": "Devices", "avatar": { "icon": "iphone" } },', 3),
    ('{ "title": "Log out", "chevron": false } ] },', 3),
    ('{ "group": "App", "rows": [', 2),
    ('{ "title": "Notifications", "avatar": { "icon": "bell" } },', 3),
    ('{ "title": "Appearance", "avatar": { "icon": "sun.max" } },', 3),
    ('{ "title": "Language", "avatar": { "icon": "globe" } } ] }', 3),
    ('],', 1), ('"bottom": { "chat": ["Change my address", "Is my money safe?"] }', 1), ('}', 0),
]
BLOCKS = [(0, 120, [2]), (168, 180, [4]), (396, 234, [5, 6, 7, 8]), (678, 302, [9, 10, 11, 12, 13]), (1028, 234, [14, 15, 16, 17])]

def spec_card(PW, typed, hl):
    f = font(MONO, 28, 'Regular'); lh = 52
    img, pad = card(PW, len(SPEC) * lh // 2 + 64); d = ImageDraw.Draw(img); sp = d.textlength(' ', font=f)
    for i, (txt, ind) in enumerate(SPEC):
        k = clamp(typed - i)
        if k <= 0: break
        ym = pad + 64 + i * lh + lh / 2; a = clamp(hl.get(i, 0))
        if a > 0.01:
            col = tuple(int(lerp(255, v, a)) for v in (239, 239, 235))
            d.rounded_rectangle([pad + 26, ym - lh / 2 + 4, pad + PW * 2 - 26, ym + lh / 2 - 4], 12, fill=col + (255,))
        tokens(d, pad + 56 + ind * 2 * sp, ym + (1 - out4(k)) * 10, txt, f, int(255 * out4(k)))
    return Sprite(img)

def assemble(base, t, starts, chat_at):
    """The viewport with its blocks appearing one by one (rise + fade)."""
    k2 = base.width / 402; scr = Image.new('RGB', base.size, (255, 255, 255))
    for j, (y, h, _) in enumerate(BLOCKS):
        p = out4(phase(t, starts[j], 0.65))
        if p <= 0: continue
        top, bot = (0 if j == 0 else y), min(874 - 184, y + h + 48)
        if top >= bot: continue
        piece = base.crop((0, int(top * k2), base.width, int(bot * k2)))
        scr.paste(piece, (0, int(top * k2 + (1 - p) * 24 * k2)), Image.new('L', piece.size, int(255 * p)))
    pb = out4(phase(t, chat_at, 0.65))
    if pb > 0:
        ch = base.crop((0, int((874 - 244) * k2), base.width, base.height))
        scr.paste(ch, (0, int((874 - 244) * k2 + (1 - pb) * 44 * k2)), Image.new('L', ch.size, int(255 * pb)))
    return scr

def clip_spec_to_screen():
    W, H = 1440, 1080; N = int(12 * FPS)
    starts = [1.7 + j * 0.72 for j in range(len(BLOCKS))]; chat_at = starts[-1] + 0.78
    s0, sd = chat_at + 1.3, 3.2
    for i in frames(N):
        t = i / FPS; c = canvas(W, H)
        sk = inout(phase(t, s0, sd)); scroll = 572 * sk
        hl = {}
        def light(lines, at, peak=1.0):
            on = peak * sine(phase(t, at - 0.15, 0.5)) * (1 - sine(phase(t, at + 0.95, 0.6)))
            for ln in lines: hl[ln] = max(hl.get(ln, 0), on)
        for j, (_, _, lines) in enumerate(BLOCKS): light(lines, starts[j])
        light([19], chat_at)
        light(BLOCKS[3][2], s0 + 0.6, 0.55); light(BLOCKS[4][2], s0 + 1.8, 0.55)
        spec_card(690, (t - 0.2) * 16, hl).draw(c, 412, H / 2, 0.5)
        base = viewport('profile', scroll)
        scr = base if t >= s0 else assemble(base, t, starts, chat_at)
        Phone(scr).draw(c, 1104, H / 2 + 2, 0.9)
        save(c, '02-spec-to-screen', i)

# ---------- 03 · a flow as a prototype ----------
FLOW = ['c1', 'c2', 'c3', 'c4']
TAPS = [(1.9, (143, 754)), (4.5, (201, 458)), (7.1, (201, 803))]   # (time, point on the current screen)
def tap(c, x, y, k):
    if k <= 0 or k >= 1: return
    S, R = 4, 90
    o = Image.new('RGBA', (R * 2 * S, R * 2 * S), (0, 0, 0, 0)); d = ImageDraw.Draw(o); cx = cy = R * S
    press = math.sin(math.pi * clamp(k / 0.55)); r = (23 - 5 * press) * S; a = int(105 * math.sin(math.pi * k))
    d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=(20, 20, 18, a))
    if k > 0.2:
        q = (k - 0.2) / 0.8; rr = (23 + 48 * out4(q)) * S
        d.ellipse([cx - rr, cy - rr, cx + rr, cy + rr], outline=(20, 20, 18, int(70 * (1 - q))), width=3 * S)
    Sprite(o).draw(c, x, y, 1 / S)

def clip_flow():
    W, H = 1440, 1080; N = int(11 * FPS); scale, gap = 0.84, 80
    phones = [Phone(viewport(n)) for n in FLOW]
    for i in frames(N):
        t = i / FPS; c = canvas(W, H)
        cur = sum(inout(phase(t, tt + 0.55, 1.0)) for tt, _ in TAPS)
        pw = 402 * scale
        for j in sorted(range(len(phones)), key=lambda j: -abs(j - cur)):
            dist = j - cur; ad = min(1.0, abs(dist)); s = scale * (1 - 0.12 * ad)
            cx = W / 2 + dist * (pw + gap) * (1 - 0.06 * ad)
            if -pw < cx < W + pw: phones[j].draw(c, cx, H / 2 + 6, s, alpha=1 - 0.55 * ad, shadow=1 - 0.5 * ad)
        for tt, (x, y) in TAPS: tap(c, W / 2 + (x - 201) * scale, H / 2 + 6 + (y - 437) * scale, phase(t, tt, 0.75))
        save(c, '03-flow', i)

# ---------- 04 · one switch: persona and brand ----------
def switch(c, cx, cy, n, pos, colors):
    S, gapx = 4, 30; w, h = int(((n - 1) * gapx + 60) * S), 40 * S
    o = Image.new('RGBA', (w, h), (0, 0, 0, 0)); d = ImageDraw.Draw(o)
    d.rounded_rectangle([0, 0, w - 1, h - 1], h // 2, fill=(255, 255, 255, 255))
    x0 = 30 * S
    for k in range(n): d.ellipse([x0 + k * gapx * S - 5 * S, h / 2 - 5 * S, x0 + k * gapx * S + 5 * S, h / 2 + 5 * S], fill=colors[k] + (80,))
    ax = x0 + pos * gapx * S; lo, hi = colors[int(math.floor(pos))], colors[min(n - 1, int(math.ceil(pos)))]
    col = tuple(int(lerp(a, b, pos - math.floor(pos))) for a, b in zip(lo, hi))
    d.rounded_rectangle([ax - 13 * S, h / 2 - 8 * S, ax + 13 * S, h / 2 + 8 * S], 8 * S, fill=col + (255,))
    Sprite(o).draw(c, cx, cy, 1 / S)

def clip_switch():
    W, H = 1440, 1080; N = int(10 * FPS); scale = 0.8
    pairs = [(viewport('chat-check'), viewport('chat-check-caregiver')), (viewport('profile'), viewport('profile-atlas'))]
    pcol = [(122, 122, 255), (86, 196, 220), (255, 128, 86), (255, 92, 160)]; bcol = [(255, 45, 85), (11, 31, 77)]
    cache = {}
    for i in frames(N):
        t = i / FPS; c = canvas(W, H)
        kp = inout(phase(t, 1.6, 0.9)) - inout(phase(t, 6.4, 0.9))
        kb = inout(phase(t, 3.6, 0.9)) - inout(phase(t, 8.2, 0.9))
        for j, ((a, b), k, cx) in enumerate(((pairs[0], kp, W / 2 - 245), (pairs[1], kb, W / 2 + 245))):
            key = (j, round(k, 2))
            if key not in cache: cache[key] = Phone(Image.blend(a, b, round(k, 2)))
            cache[key].draw(c, cx, H / 2 - 34, scale)
        switch(c, W / 2 - 245, H - 86, 4, 3 * clamp(kp), pcol)
        switch(c, W / 2 + 245, H - 86, 2, clamp(kb), bcol)
        save(c, '04-switch', i)

# ---------- 05 · the whole library as one plane: smooth zoom ----------
GRID = ['profile', 'notifications', 'account', 'c1', 'c3', 'send-confirm', 'chat-food', 'chat-check',
        'c4', 'send-pay-from', 'chat-salary', 'profile-atlas', 'c2', 'chat-check-caregiver', 'chat-done']
def grid_plane(cols, names, gap=64, margin=200):
    rows = math.ceil(len(names) / cols)
    PW, PH = cols * 402 + (cols - 1) * gap + 2 * margin, rows * 874 + (rows - 1) * gap + 2 * margin
    plane = Image.new('RGBA', (PW, PH), BG + (255,))
    for idx, n in enumerate(names):
        r, q = divmod(idx, cols)
        Phone(viewport(n)).draw(plane, margin + q * (402 + gap) + 201, margin + r * (874 + gap) + 437, 1.0)
    return plane

def clip_library():
    W, H = 1440, 1080; N = int(10 * FPS)
    plane = Sprite(grid_plane(5, GRID))
    for i in frames(N):
        t = i / FPS; c = canvas(W, H)
        z = lerp(0.58, 0.335, inout(phase(t, 0, 9.4)))
        dx = lerp(70, 0, inout(phase(t, 0, 9.4))); dy = lerp(60, 0, inout(phase(t, 0, 9.4)))
        plane.draw(c, W / 2 + dx, H / 2 + dy, z, alpha=out4(phase(t, 0, 0.9)))
        save(c, '05-library', i)

# ---------- hero: an endless tilted gallery, one screen assembling in front ----------
def perspective_coeffs(src, dst):
    A, B = [], []
    for (x, y), (u, v) in zip(dst, src):
        A.append([x, y, 1, 0, 0, 0, -u * x, -u * y]); B.append(u)
        A.append([0, 0, 0, x, y, 1, -v * x, -v * y]); B.append(v)
    return list(np.linalg.solve(np.array(A, float), np.array(B, float)))

def clip_hero():
    W, H = 1920, 1080; N = int(14 * FPS)
    names = ['profile', 'chat-food', 'account', 'c3', 'chat-check', 'notifications', 'send-confirm', 'c1',
             'chat-salary', 'profile-atlas', 'send-pay-from', 'chat-done', 'c4', 'chat-check-caregiver', 'c2']
    tile, gapx, gapy, cols = 300, 46, 46, 8
    th = tile * 874 / 402
    strips = []
    for q in range(cols):                      # each column: a strip of screens, repeated for a seamless loop
        seq = [names[(q * 4 + k) % len(names)] for k in range(5)]
        sh = int(len(seq) * (th + gapy))
        strip = Image.new('RGBA', (tile + 120, sh * 2 + 200), (0, 0, 0, 0))
        for rep in range(2):
            for k, n in enumerate(seq):
                Phone(viewport(n)).draw(strip, 60 + tile / 2, 100 + rep * sh + k * (th + gapy) + th / 2, tile / 402)
        strips.append((strip, sh))
    PW, PH = cols * (tile + gapx) + 200, 2500
    def project(X, Y):                         # the gallery lies tilted and recedes to the top
        ang = math.radians(-16); x = X * math.cos(ang) - Y * math.sin(ang); y = X * math.sin(ang) + Y * math.cos(ang)
        tilt = math.radians(40); yz = y * math.cos(tilt); z = y * math.sin(tilt) + 3000
        f = 2100; return (W / 2 + f * x / z, H / 2 + 60 + f * yz / z)
    pc = [(0, 0), (PW, 0), (PW, PH), (0, PH)]
    coeffs = perspective_coeffs(pc, [project(x - PW / 2, y - PH / 2) for x, y in pc])
    fog = Image.new('L', (W, H), 0); fd = ImageDraw.Draw(fog)
    for y in range(H):
        e = max(0.0, 1 - min(y, H - y) / 330); fd.line([(0, y), (W, y)], fill=int(255 * e ** 1.7))
    fS = font(SANS, 52); focal = viewport('profile')
    starts = [4.6 + j * 0.42 for j in range(len(BLOCKS))]; chat_at = starts[-1] + 0.5
    for i in frames(N):
        t = i / FPS
        plane = Image.new('RGBA', (PW, PH), BG + (255,))
        for q, (strip, sh) in enumerate(strips):
            speed = 30 + (q % 3) * 8; off = (t * speed * (1 if q % 2 else -1) + q * 137) % sh
            plane.alpha_composite(strip, (100 + q * (tile + gapx) - 60, int(-off) - 100))
        c = plane.transform((W, H), Image.PERSPECTIVE, coeffs, resample=Image.BICUBIC, fillcolor=BG + (255,))
        c.paste(BG + (255,), (0, 0), fog)
        veil = lerp(0.5, 0.2, inout(phase(t, 9.6, 2.6)))
        if veil > 0: c.alpha_composite(Image.new('RGBA', (W, H), BG + (int(255 * veil),)))
        pin_, pout = out4(phase(t, 0.4, 0.8)), inout(phase(t, 4.1, 0.7))
        if pin_ > 0 and pout < 1:
            img, pad = card(1040, 104, 52); d = ImageDraw.Draw(img)
            n = int(len(PROMPT) * phase(t, 1.0, 2.6)); txt = PROMPT[:n] if n else 'Что собрать?'
            d.text((pad + 56, pad + 104), txt, font=fS, fill=(INK if n else MUTE) + (255,), anchor='lm')
            if n and t < 3.8 and int(t * 2.4) % 2 == 0:
                x_ = pad + 56 + d.textlength(txt, font=fS) + 5; d.line([(x_, pad + 70), (x_, pad + 138)], fill=INK + (255,), width=4)
            send_button(d, pad + 2080 - 74, pad + 104, 44 - 6 * math.sin(math.pi * phase(t, 3.85, 0.3)))
            Sprite(img).draw(c, W / 2, lerp(H / 2, H / 2 - 50, pout) + (1 - pin_) * 24, 0.5 * lerp(1, 0.95, pout), alpha=pin_ * (1 - pout))
        appear = out4(phase(t, 4.3, 0.9))
        if appear > 0:
            scr = focal if t > chat_at + 0.8 else assemble(focal, t, starts, chat_at)
            Phone(scr).draw(c, W / 2, H / 2 + 6 + (1 - appear) * 36 + math.sin(t * 0.9) * 3, lerp(0.84, 0.9, appear), alpha=appear)
        save(c, 'hero', i)

CLIPS = {'01-ask': clip_ask, '02-spec-to-screen': clip_spec_to_screen, '03-flow': clip_flow,
         '04-switch': clip_switch, '05-library': clip_library, 'hero': clip_hero}
if __name__ == '__main__':
    for name in (sys.argv[3:] or CLIPS):
        CLIPS[name](); print('frames:', name, flush=True)

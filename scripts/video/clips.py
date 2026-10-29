"""Short 4:3 product clips of the re:verse DS process: prompt → spec → screen → flow → switches → grid.

    python3 scripts/video/clips.py <shots dir> <out dir> [clip ...]

<shots dir> holds 2x PNG exports of the golden screens (download_assets, scale 2).
Frames go to <out dir>/<clip>/; scripts/video/encode.swift turns each folder into an MP4.
No titles: every clip sits in a light card and shows the product only.
"""
import math, os, sys
from PIL import Image, ImageDraw, ImageFilter, ImageFont

W, H, FPS = 1440, 1080, 30
BG = (243, 243, 241)
INK, GREY, LIGHT = (24, 24, 24), (138, 138, 134), (196, 196, 192)
SHOTS, OUT = sys.argv[1], sys.argv[2]

SANS = '/Library/Fonts/SF-Pro-Display-Regular.otf'
SANS_M = '/Library/Fonts/SF-Pro-Display-Medium.otf'
MONO = '/System/Library/Fonts/SFNSMono.ttf'
font = lambda p, s: ImageFont.truetype(p, s)

# ---------- easing ----------
def clamp(x, a=0.0, b=1.0): return max(a, min(b, x))
def ease_out(t): t = clamp(t); return 1 - (1 - t) ** 3
def ease_in_out(t): t = clamp(t); return 4 * t ** 3 if t < .5 else 1 - (-2 * t + 2) ** 3 / 2
def phase(t, start, dur): return clamp((t - start) / dur)
def lerp(a, b, k): return a + (b - a) * k

# ---------- screens ----------
_cache = {}
def shot(name):
    if name not in _cache: _cache[name] = Image.open(os.path.join(SHOTS, name + '.png')).convert('RGB')
    return _cache[name]

def viewport(name, scroll=0, pin_top=0, pin_bottom=None, fade=96):
    """A 402×874 phone viewport (2x pixels) of a long screen: content scrolled, status/top bar and
    the bottom chat pinned like on the device. pin_bottom = y where the bottom chat starts in the frame."""
    s = shot(name); sw, sh = s.size; k = sw / 402
    vh = int(874 * k); y0 = int(scroll * k)
    v = s.crop((0, y0, sw, y0 + vh))
    def band(y, h, down):  # white gradient so content slides under pinned bars like on the device
        m = Image.new('L', (sw, max(1, int(h * k))), 0); d = ImageDraw.Draw(m)
        for i in range(m.size[1]): d.line([(0, i), (sw, i)], fill=int(255 * ((1 - i / m.size[1]) if down else i / m.size[1]) ** 1.3))
        v.paste((255, 255, 255), (0, int(y * k)), m)
    if pin_top and scroll > 0:
        v.paste(s.crop((0, 0, sw, int(pin_top * k))), (0, 0)); band(pin_top, 28, True)
    if pin_bottom is not None:
        chat = s.crop((0, int(pin_bottom * k), sw, sh))
        top = 874 - chat.size[1] / k
        band(top - fade * 0.6, fade * 0.6, False)
        v.paste(chat, (0, vh - chat.size[1]))
    return v

# ---------- phone with soft shadow ----------
_shadow = {}
def phone(img, scale):
    """Screen with rounded corners on a transparent layer + its soft shadow; returns (layer, offset)."""
    w, h = int(402 * scale), int(874 * scale); r = int(46 * scale)
    scr = img.resize((w, h), Image.LANCZOS)
    mask = Image.new('L', (w * 3, h * 3), 0); ImageDraw.Draw(mask).rounded_rectangle([0, 0, w * 3 - 1, h * 3 - 1], r * 3, fill=255)
    mask = mask.resize((w, h), Image.LANCZOS)
    pad = int(90 * scale) + 10
    key = (w, h)
    if key not in _shadow:
        sh = Image.new('L', (w + pad * 2, h + pad * 2), 0)
        ImageDraw.Draw(sh).rounded_rectangle([pad, pad + int(22 * scale), pad + w, pad + h + int(22 * scale)], r, fill=46)
        _shadow[key] = sh.filter(ImageFilter.GaussianBlur(int(34 * scale) + 4))
    layer = Image.new('RGBA', (w + pad * 2, h + pad * 2), (0, 0, 0, 0))
    layer.paste((20, 20, 18, 255), (0, 0), _shadow[key])
    layer.paste(scr, (pad, pad), mask)
    edge = Image.new('RGBA', (w, h), (0, 0, 0, 0)); ImageDraw.Draw(edge).rounded_rectangle([0, 0, w - 1, h - 1], r, outline=(0, 0, 0, 22), width=1)
    layer.alpha_composite(edge, (pad, pad))
    return layer, pad

def place(canvas, layer, pad, cx, cy, alpha=1.0, scale_box=None):
    w, h = layer.size
    if alpha < 1:
        a = layer.getchannel('A').point(lambda v: int(v * alpha)); layer = layer.copy(); layer.putalpha(a)
    canvas.alpha_composite(layer, (int(cx - w / 2), int(cy - h / 2)))

def new_canvas(): return Image.new('RGBA', (W, H), BG + (255,))

def tap(canvas, x, y, k):
    """Touch indicator: a soft dot that presses and a ring that expands (k: 0→1)."""
    if k <= 0 or k >= 1: return
    o = Image.new('RGBA', (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(o)
    press = math.sin(math.pi * clamp(k / 0.6))
    r = 26 - 6 * press; a = int(120 * math.sin(math.pi * k))
    d.ellipse([x - r, y - r, x + r, y + r], fill=(20, 20, 20, a))
    if k > 0.25:
        q = (k - 0.25) / 0.75; rr = 26 + 46 * ease_out(q)
        d.ellipse([x - rr, y - rr, x + rr, y + rr], outline=(20, 20, 20, int(90 * (1 - q))), width=3)
    canvas.alpha_composite(o)

ONLY = [int(x) for x in os.environ.get('ONLY', '').split(',') if x]  # preview: ONLY=45,120
def frames(n): return [i for i in ONLY if i < n] if ONLY else range(n)

def save(canvas, clip, i):
    d = os.path.join(OUT, clip); os.makedirs(d, exist_ok=True)
    canvas.convert('RGB').save(os.path.join(d, f'{i:05d}.png'), compress_level=1)

# ---------- clip 1: prompt → spec ----------
PROMPT = 'Собери экран профиля: данные, безопасность, настройки'
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

def draw_json_line(d, x, y, text, f, alpha=255, hl=False):
    """Light syntax colouring: keys grey, strings ink, punctuation light."""
    import re
    parts = re.split(r'("[^"]*"\s*:|"[^"]*")', text)
    cx = x
    for p in parts:
        if not p: continue
        col = GREY if p.rstrip().endswith(':') else INK if p.startswith('"') else (150, 150, 146)
        d.text((cx, y), p, font=f, fill=col + (alpha,))
        cx += d.textlength(p, font=f)

def panel(w, h, r=28):
    sh = Image.new('L', (w + 120, h + 120), 0)
    ImageDraw.Draw(sh).rounded_rectangle([60, 74, 60 + w, 74 + h], r, fill=34)
    sh = sh.filter(ImageFilter.GaussianBlur(26))
    layer = Image.new('RGBA', sh.size, (0, 0, 0, 0)); layer.paste((20, 20, 18, 255), (0, 0), sh)
    ImageDraw.Draw(layer).rounded_rectangle([60, 60, 60 + w, 60 + h], r, fill=(255, 255, 255, 255))
    return layer

def spec_panel(t_lines, w=880, size=19, highlight=None, line_h=None, visible=None):
    """White card with the spec typed line by line; t_lines = how many lines (float) are shown."""
    f = font(MONO, size); lh = line_h or int(size * 1.62)
    h = lh * len(SPEC) + 64
    layer = panel(w, h); d = ImageDraw.Draw(layer)
    for i, (txt, ind) in enumerate(SPEC):
        k = clamp(t_lines - i)
        if k <= 0: break
        y = 60 + 32 + i * lh + int((1 - ease_out(k)) * 8)
        if highlight and i in highlight:
            a = clamp(highlight[i]); col = tuple(int(lerp(255, v, a)) for v in (234, 234, 229))
            if a > 0.01: d.rounded_rectangle([60 + 18, y - 5, 60 + w - 18, y + lh - 7], 8, fill=col + (255,))
        draw_json_line(d, 60 + 36 + ind * 2 * d.textlength(' ', font=f), y, txt, f, int(255 * ease_out(k)))
    return layer

def clip_prompt():
    N = int(8.0 * FPS); f = font(SANS, 30)
    for i in frames(N):
        t = i / FPS; c = new_canvas(); d = ImageDraw.Draw(c)
        # the prompt pill: appears, types, sends, then floats up
        rise = ease_in_out(phase(t, 3.6, 0.9))
        pw, ph = 980, 92
        px, py = (W - pw) // 2, int(lerp(H / 2 - ph / 2, 70, rise))
        a = ease_out(phase(t, 0.2, 0.6))
        pill = panel(pw, ph, ph // 2)
        if a < 1: pill.putalpha(pill.getchannel('A').point(lambda v: int(v * a)))
        c.alpha_composite(pill, (px - 60, py - 60 + int((1 - a) * 16)))
        n = int(len(PROMPT) * phase(t, 0.9, 2.3))
        txt = PROMPT[:n]
        tx, ty = px + 40, py + ph / 2 - 19
        if n == 0 and t < 0.9: d.text((tx, ty), 'Что собрать?', font=f, fill=LIGHT + (int(255 * a),))
        else: d.text((tx, ty), txt, font=f, fill=INK + (255,))
        if t < 3.4 and int(t * 2.2) % 2 == 0 and a > 0.9:
            cx = tx + d.textlength(txt, font=f) + 3; d.line([(cx, ty + 2), (cx, ty + 36)], fill=INK, width=2)
        # send button presses at 3.3s
        press = math.sin(math.pi * phase(t, 3.25, 0.3)); br = 30 - 4 * press
        bx, by = px + pw - 46, py + ph / 2
        d.ellipse([bx - br, by - br, bx + br, by + br], fill=INK + (int(255 * a),))
        d.line([(bx, by + 11), (bx, by - 11)], fill=(255, 255, 255), width=3)
        d.line([(bx - 9, by - 2), (bx, by - 11), (bx + 9, by - 2)], fill=(255, 255, 255), width=3, joint='curve')
        # spec grows below
        if t > 4.0:
            sp = spec_panel((t - 4.1) * 7.5, w=980, size=18)
            k = ease_out(phase(t, 4.0, 0.5))
            sp.putalpha(sp.getchannel('A').point(lambda v: int(v * k)))
            c.alpha_composite(sp, ((W - 980) // 2 - 60, 70 + ph + 26 - 60 + int((1 - k) * 20)))
        save(c, 'prompt', i)

# ---------- clip 2: spec → screen, block by block ----------
PROFILE_BLOCKS = [  # (frame y, height, spec lines it comes from)
    (0, 120, [2]), (168, 180, [4]), (396, 234, [5, 6, 7, 8]), (678, 302, [9, 10, 11, 12, 13]), (1028, 234, [14, 15, 16, 17]),
]
def clip_assembly():
    N = int(10.5 * FPS); scale = 0.92
    full = viewport('profile', 0)
    for i in frames(N):
        t = i / FPS; c = new_canvas()
        # left: the spec, lines light up as their block lands
        hl = {}
        starts = [0.6 + j * 0.62 for j in range(len(PROFILE_BLOCKS))]
        for j, (_, _, lines) in enumerate(PROFILE_BLOCKS):
            on = math.sin(math.pi * phase(t, starts[j] - 0.1, 0.9))
            for ln in lines: hl[ln] = max(hl.get(ln, 0), on)
        bottom_on = math.sin(math.pi * phase(t, 4.0, 0.9)); hl[19] = bottom_on
        scroll_k = ease_in_out(phase(t, 5.6, 3.0))
        for j in (3, 4):  # sections revealed by the scroll
            if scroll_k > 0.2 * j - 0.4: pass
        sp = spec_panel(len(SPEC), w=660, size=14, highlight=hl)
        c.alpha_composite(sp, (70 - 60, (H - sp.size[1]) // 2))
        # right: the phone builds up
        scroll = 572 * scroll_k
        base = viewport('profile', scroll, pin_top=62, pin_bottom=1262)
        k2 = base.size[0] / 402
        scr = Image.new('RGB', base.size, (255, 255, 255))
        for j, (y, h, _) in enumerate(PROFILE_BLOCKS):
            p = ease_out(phase(t, starts[j], 0.55))
            if p <= 0: continue
            if t > 5.4: p = 1
            yy = y - scroll if j > 0 else 0
            box = (0, int(yy * k2), base.size[0], int((yy + h + (48 if j else 0)) * k2))
            if box[3] <= 0 or box[1] >= base.size[1]: continue
            piece = base.crop((0, max(0, box[1]), base.size[0], min(base.size[1], box[3])))
            m = Image.new('L', piece.size, int(255 * p))
            scr.paste(piece, (0, max(0, box[1]) + int((1 - p) * 30 * k2)), m)
        # bottom chat rises
        pb = ease_out(phase(t, 4.0, 0.6))
        if pb > 0:
            chat = base.crop((0, int(690 * k2), base.size[0], base.size[1]))
            m = Image.new('L', chat.size, int(255 * pb))
            scr.paste(chat, (0, int(690 * k2) + int((1 - pb) * 60 * k2)), m)
        if t > 5.4: scr = base
        layer, pad = phone(scr, scale)
        place(c, layer, pad, 1060, H / 2 + 6)
        save(c, 'assembly', i)

# ---------- clip 3: a flow as a prototype ----------
FLOW = [  # (shot, scroll, pin_top, pin_bottom)
    ('c1', 0, 0, 1012), ('c2', 0, 0, None), ('c3', 0, 0, None), ('c4', 0, 0, 934),
]
TAPS = [(1.8, 'c1', (143, 754)), (4.2, 'c2', (201, 620)), (6.6, 'c3', (201, 803))]
def clip_flow():
    N = int(10 * FPS); scale = 0.86; gap = 70
    vps = [viewport(n, s, pt, pb) for n, s, pt, pb in FLOW]
    layers = {}
    for i in frames(N):
        t = i / FPS; c = new_canvas()
        cur = 0.0
        for j, (tt, _, _) in enumerate(TAPS): cur += ease_in_out(phase(t, tt + 0.55, 0.8))
        pw = 402 * scale
        order = sorted(range(len(vps)), key=lambda j: -abs(j - cur))
        for j in order:
            dist = j - cur; ad = min(1.0, abs(dist))
            s = scale * (1 - 0.14 * ad); key = (j, round(s, 3))
            if key not in layers: layers[key] = phone(vps[j], s)
            layer, pad = layers[key]
            cx = W / 2 + dist * (pw + gap) * (1 - 0.08 * ad)
            if cx < -pw or cx > W + pw: continue
            place(c, layer, pad, cx, H / 2 + 6, alpha=1 - 0.6 * ad)
        for tt, name, (x, y) in TAPS:
            k = phase(t, tt, 0.7)
            sx = W / 2 + (x - 201) * scale; sy = H / 2 + 6 + (y - 437) * scale
            tap(c, sx, sy, k)
        save(c, 'flow', i)

# ---------- clip 4: one switch — persona and brand ----------
def switch(c, cx, cy, n, pos, colors):
    """A row of n dots; the active one is a pill that slides to `pos` (float)."""
    d = ImageDraw.Draw(c); gapx = 30; x0 = cx - (n - 1) * gapx / 2
    track = Image.new('RGBA', (int((n - 1) * gapx + 56), 40), (0, 0, 0, 0))
    ImageDraw.Draw(track).rounded_rectangle([0, 0, track.size[0] - 1, 39], 20, fill=(255, 255, 255, 255))
    c.alpha_composite(track, (int(x0 - 28), int(cy - 20)))
    for k in range(n): d.ellipse([x0 + k * gapx - 5, cy - 5, x0 + k * gapx + 5, cy + 5], fill=colors[k] + (90,))
    ax = x0 + pos * gapx; ci = colors[int(round(pos))]
    d.rounded_rectangle([ax - 13, cy - 8, ax + 13, cy + 8], 8, fill=ci + (255,))

def clip_switch():
    N = int(9 * FPS); scale = 0.78
    chat_a, chat_b = viewport('chat-check'), viewport('chat-check-caregiver')
    prof_a, prof_b = viewport('profile', 0, 0, 1262), viewport('profile-atlas', 0, 0, 1262)
    persona_cols = [(120, 120, 255), (90, 200, 220), (255, 120, 80), (255, 90, 160)]
    brand_cols = [(255, 45, 85), (11, 31, 77)]
    for i in frames(N):
        t = i / FPS; c = new_canvas()
        kp = ease_in_out(phase(t, 1.4, 0.7)) - ease_in_out(phase(t, 5.6, 0.7))
        kb = ease_in_out(phase(t, 3.2, 0.7)) - ease_in_out(phase(t, 7.2, 0.7))
        for img_a, img_b, k, cx in ((chat_a, chat_b, kp, W / 2 - 250), (prof_a, prof_b, kb, W / 2 + 250)):
            mix = Image.blend(img_a, img_b, clamp(k))
            layer, pad = phone(mix, scale)
            place(c, layer, pad, cx, H / 2 - 30)
        switch(c, W / 2 - 250, H - 92, 4, 3 * clamp(kp), persona_cols)
        switch(c, W / 2 + 250, H - 92, 2, clamp(kb), brand_cols)
        save(c, 'switch', i)

# ---------- clip 5: everything, as a grid ----------
GRID = ['profile', 'notifications', 'account', 'c1', 'c3', 'send-confirm', 'chat-food', 'chat-check',
        'c4', 'send-pay-from', 'chat-salary', 'profile-atlas', 'c2', 'chat-check-caregiver', 'chat-done']
def clip_grid():
    N = int(9 * FPS); cols, rows = 5, 3
    tiles = []
    for n in GRID:
        pin = {'profile': 1262, 'profile-atlas': 1262, 'c1': 1012, 'c4': 934, 'account': 940}.get(n)
        tiles.append(viewport(n, 0, 0, pin))
    base_s = 0.5; tw, th = 402 * base_s, 874 * base_s; gx, gy = 44, 46
    gw, gh = cols * tw + (cols - 1) * gx, rows * th + (rows - 1) * gy
    cache = {}
    for i in frames(N):
        t = i / FPS; c = new_canvas()
        zoom = lerp(1.25, 0.74, ease_in_out(phase(t, 0.0, 8.4)))
        drift = lerp(60, -30, ease_in_out(phase(t, 0, 9)))
        for idx, img in enumerate(tiles):
            r, q = divmod(idx, cols)
            appear = ease_out(phase(t, 0.15 + 0.07 * idx, 0.7))
            if appear <= 0: continue
            x = (q * (tw + gx) + tw / 2 - gw / 2) * zoom + W / 2 + drift
            y = (r * (th + gy) + th / 2 - gh / 2) * zoom + H / 2 + (1 - appear) * 40
            s = round(base_s * zoom, 2)
            key = (idx, s)
            if key not in cache: cache[key] = phone(img, s)
            layer, pad = cache[key]
            place(c, layer, pad, x, y, alpha=appear)
        save(c, 'grid', i)

CLIPS = {'prompt': clip_prompt, 'assembly': clip_assembly, 'flow': clip_flow, 'switch': clip_switch, 'grid': clip_grid}
if __name__ == '__main__':
    for name in (sys.argv[3:] or CLIPS):
        CLIPS[name](); print('frames:', name)

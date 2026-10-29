"""The re:verse DS product film (16:9, 60 s). Script: docs/video/film-script.md.

    python3 scripts/video/film.py <shots dir> <frames dir> [first last]     # frames [first, last)
    swift scripts/video/encode.swift <frames dir>/film docs/video/film.mp4

One thread runs through the film: the request line. Every scene starts with a new request and the system
answers it with real screens (2x exports of golden frames). Uses the clip engine in clips.py.
"""
import math, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
import clips as E
from clips import (Sprite, Phone, viewport, card, canvas, out4, inout, sine, phase, lerp, clamp, font, SANS, MONO,
                   INK, GREY, MUTE, BG, send_button, glyph, shimmer, tap, switch, assemble, BLOCKS, perspective_coeffs)

W, H, FPS, DUR = 1920, 1080, 30, 60.0
STAGE_Y, S = 470, 0.8                         # phones: centre line and scale
DOCK_Y = 986

# ---------- the request line ----------
PROMPTS = [  # type from, type to, send, text
    (0.9, 2.6, 2.9, 'Собери экран профиля'),
    (13.6, 15.0, 15.2, 'Флоу: я потерял карту'),
    (25.0, 26.4, 26.6, 'Сделай то же в бренде Atlas'),
    (32.0, 34.0, 34.2, 'Сколько я потратил на еду в октябре?'),
    (39.6, 41.0, 41.2, 'Переведи €100 в цель Spain trip'),
]
def dock(c, t):
    appear = out4(phase(t, 0.2, 0.8))
    if appear <= 0: return
    k = inout(phase(t, 3.2, 1.2))
    cx, cy, sc = W / 2, lerp(H / 2, DOCK_Y, k), lerp(1.0, 0.82, k)
    img, pad = card(1040, 104, 52); d = ImageDraw.Draw(img); f = font(SANS, 52)
    cur = None
    for p in PROMPTS:
        if t >= p[0] - 0.4: cur = p
    holder = 'Что собрать дальше?' if t > 48.4 else 'Что собрать?'
    text, col, caret = holder, MUTE, False
    if cur and t < cur[2]:
        n = int(len(cur[3]) * phase(t, cur[0], cur[1] - cur[0]))
        if n: text, col, caret = cur[3][:n], INK, int(t * 2.4) % 2 == 0
    if t > 48.4: caret = int(t * 1.8) % 2 == 0
    x0 = pad + 56
    if caret and text == holder:
        d.line([(x0 - 6, pad + 70), (x0 - 6, pad + 138)], fill=INK + (255,), width=4)
    d.text((x0, pad + 104), text, font=f, fill=col + (255,), anchor='lm')
    if caret and text != holder:
        x_ = x0 + d.textlength(text, font=f) + 5; d.line([(x_, pad + 70), (x_, pad + 138)], fill=INK + (255,), width=4)
    press = max((math.sin(math.pi * phase(t, p[2] - 0.15, 0.3)) for p in PROMPTS), default=0)
    send_button(d, pad + 2080 - 74, pad + 104, 44 - 6 * press)
    Sprite(img).draw(c, cx, cy + (1 - appear) * 24, 0.5 * sc, alpha=appear)
    # a sent request lifts off the line and dissolves (the first one becomes the bubble in scene 2)
    for p in PROMPTS[1:]:
        k2 = phase(t, p[2], 0.7)
        if 0 < k2 < 1:
            o = Image.new('RGBA', (2000, 120), (0, 0, 0, 0)); ImageDraw.Draw(o).text((0, 60), p[3], font=f, fill=INK + (255,), anchor='lm')
            Sprite(o).draw(c, cx - 1040 * sc / 2 + 28 * sc + 1000 * 0.5 * sc, cy - out4(k2) * 70, 0.5 * sc, alpha=1 - k2)

# ---------- scene 2: thinking + the profile assembling ----------
THINK = [('Читаю правила', 'AGENTS.md'), ('Выбираю рецепт', 'recipes/profile.md'), ('Планирую экран', 'герой · 3 секции'),
         ('Беру данные', 'persona.md'), ('Пишу спеку', 'линтер · 0 ошибок')]
def think_card(c, t):
    a_in, a_out = out4(phase(t, 4.6, 0.7)), inout(phase(t, 12.8, 0.7))
    if a_in <= 0 or a_out >= 1: return
    PW, PH = 640, 452
    img, pad = card(PW, PH); d = ImageDraw.Draw(img); fL, fM, fB = font(SANS, 46), font(MONO, 32, 'Regular'), font(SANS, 44)
    txt = PROMPTS[0][3]; tw = d.textlength(txt, font=fB); bw, bh = tw + 72, 92
    bx0 = pad + PW * 2 - 44 - bw; by0 = pad + 44
    d.rounded_rectangle([bx0, by0, bx0 + bw, by0 + bh], bh // 2, fill=(240, 240, 237, 255))
    d.text((bx0 + 36, by0 + bh / 2), txt, font=fB, fill=INK + (255,), anchor='lm')
    y = by0 + bh + 84
    for j, (label, detail) in enumerate(THINK):
        st = 5.0 + j * 0.7; k = out4(phase(t, st, 0.45))
        if k <= 0: break
        done = phase(t, st + 0.55, 0.3); ym = y + j * 92 + (1 - k) * 14; a = int(255 * k)
        glyph(d, pad + 74, ym, 19, t, done)
        d.text((pad + 124, ym), label, font=fL, fill=(INK if done >= 1 else GREY) + (a,), anchor='lm')
        if done < 1: shimmer(img, pad + 124, ym, label, fL, t, a)
        d.text((pad + 124 + d.textlength(label, font=fL) + 26, ym + 1), detail, font=fM, fill=(158, 158, 154, a), anchor='lm')
    Sprite(img).draw(c, 560 - 160 * a_out, STAGE_Y + (1 - a_in) * 30, 0.5, alpha=a_in * (1 - a_out))

def profile_phone(c, t):
    a_in, a_out = out4(phase(t, 5.4, 0.7)), inout(phase(t, 12.8, 0.8))
    if a_in <= 0 or a_out >= 1: return
    scroll = 572 * inout(phase(t, 10.0, 2.4))
    base = viewport('profile', scroll)
    starts = [6.1 + j * 0.55 for j in range(len(BLOCKS))]; chat_at = starts[-1] + 0.6
    scr = base if t >= 10.0 else assemble(base, t, starts, chat_at)
    Phone(scr).draw(c, 1250 - 380 * a_out, STAGE_Y + (1 - a_in) * 40, S, alpha=a_in * (1 - a_out))

# ---------- scene 3: the freeze-card flow as a prototype ----------
FLOW = ['c1', 'c2', 'c3', 'c4']; TAPS = [(17.6, (143, 754)), (19.9, (201, 458)), (22.2, (201, 803))]
_flow = {}
def flow(c, t):
    if t < 15.3 or t > 25.3: return
    if not _flow: _flow.update({n: Phone(viewport(n)) for n in FLOW})
    cur = sum(inout(phase(t, tt + 0.55, 0.9)) for tt, _ in TAPS)
    out = inout(phase(t, 24.3, 0.9)); pw = 402 * S
    for j in sorted(range(4), key=lambda j: -abs(j - cur)):
        dist = j - cur; ad = min(1.0, abs(dist)); s = S * (1 - 0.12 * ad)
        enter = out4(phase(t, 15.4 + j * 0.09, 1.0))
        cx = W / 2 + dist * (pw + 84) * (1 - 0.06 * ad) + (1 - enter) * 1100 - out * 700
        if -pw < cx < W + pw: _flow[FLOW[j]].draw(c, cx, STAGE_Y, s, alpha=enter * (1 - 0.55 * ad) * (1 - out), shadow=1 - 0.5 * ad)
    for tt, (x, y) in TAPS: tap(c, W / 2 + (x - 201) * S, STAGE_Y + (y - 437) * S, phase(t, tt, 0.75))

# ---------- scene 4: the brand switches behind a line ----------
_wipe = {}
def brand(c, t):
    a_in, a_out = out4(phase(t, 26.8, 0.8)), inout(phase(t, 31.1, 0.8))
    if a_in <= 0 or a_out >= 1: return
    if not _wipe: _wipe.update({k: viewport(k) for k in ('c1', 'c1-atlas', 'profile', 'profile-atlas')})
    p = inout(phase(t, 28.0, 2.0))
    for (a, b), cx in ((('c1', 'c1-atlas'), W / 2 - 236), (('profile', 'profile-atlas'), W / 2 + 236)):
        A, B = _wipe[a], _wipe[b]; k2 = A.width / 402
        split = int((p * 452 - 25) * k2)
        scr = A.copy()
        if split > 0: scr.paste(B.crop((0, 0, min(A.width, split), A.height)), (0, 0))
        if 0 < p < 1 and 0 < split < A.width:
            o = Image.new('RGBA', (40, A.height), (0, 0, 0, 0)); od = ImageDraw.Draw(o)
            for k in range(40): od.line([(k, 0), (k, A.height)], fill=(255, 255, 255, int(110 * math.exp(-((k - 20) / 8) ** 2))))
            od.line([(20, 0), (20, A.height)], fill=(22, 22, 20, 150), width=3)
            scr = scr.convert('RGBA'); scr.alpha_composite(o, (split - 20, 0)); scr = scr.convert('RGB')
        Phone(scr).draw(c, cx, STAGE_Y + (1 - a_in) * 40 + a_out * 30, S, alpha=a_in * (1 - a_out))

# ---------- scene 5: the assistant ----------
PARTS = [(35.2, 314, 386), (35.9, 402, 486), (36.6, 502, 570), (37.2, 578, 642), (37.8, 658, 686), (38.3, 690, 752)]
PERSONAS = ['chat-check', 'chat-check-analyst', 'chat-check-trickster', 'chat-check-caregiver']
PCOL = [(122, 122, 255), (86, 196, 220), (255, 128, 86), (255, 92, 160)]
_chat = {}
def chat_swap(old, new, k):
    """Like the product: the old answer fades out, the background settles, the new answer fades in
    (no double exposure of two answers)."""
    if k <= 0: return old
    if k >= 1: return new
    k2 = old.width / 402; y0, y1 = int(120 * k2), int(690 * k2)
    a, b, c = clamp(k / 0.4), clamp((k - 0.3) / 0.4), clamp((k - 0.6) / 0.4)
    base = Image.blend(old, new, inout(b))
    dark = Image.new('RGB', (old.width, y1 - y0), old.getpixel((old.width // 2, y0 + 20)))
    region = Image.blend(old.crop((0, y0, old.width, y1)), dark, out4(a)) if c <= 0 else Image.blend(dark, new.crop((0, y0, new.width, y1)), out4(c))
    m = Image.new('L', region.size, 255); md = ImageDraw.Draw(m); fh = int(60 * k2)
    for i in range(fh): md.line([(0, region.height - 1 - i), (region.width, region.height - 1 - i)], fill=int(255 * i / fh))
    base.paste(region, (0, y0), m); return base
def persona_pos(t):
    pos = 0.0
    for k, at in enumerate((42.8, 43.8, 44.8)): pos += inout(phase(t, at, 0.5))
    return pos
def assistant(c, t):
    a_in, a_out = out4(phase(t, 34.4, 0.7)), phase(t, 48.4, 1.6)
    if a_in <= 0 or a_out >= 1: return
    if not _chat:
        _chat.update({k: viewport(k) for k in ['chat-empty', 'chat-food', 'chat-done'] + PERSONAS})
    k2 = _chat['chat-empty'].width / 402
    if t < 42.1:
        scr = _chat['chat-empty'].copy(); src = _chat['chat-food']
        for st, y0, y1 in PARTS:
            p = out4(phase(t, st, 0.6))
            if p <= 0: continue
            piece = src.crop((0, int(y0 * k2), src.width, int(y1 * k2)))
            scr.paste(piece, (0, int((y0 + (1 - p) * 18) * k2)), Image.new('L', piece.size, int(255 * p)))
        scr = chat_swap(scr, _chat['chat-check'], phase(t, 41.3, 0.8))
    else:
        pos = persona_pos(t); back = inout(phase(t, 45.9, 0.5))
        lo, hi = int(math.floor(pos)), min(3, int(math.ceil(pos)))
        scr = Image.blend(_chat[PERSONAS[lo]], _chat[PERSONAS[hi]], pos - lo) if hi != lo else _chat[PERSONAS[lo]]
        if back > 0: scr = Image.blend(scr, _chat[PERSONAS[0]], back)
        scr = chat_swap(scr, _chat['chat-done'], phase(t, 47.0, 0.8))
    shrink = inout(a_out)
    Phone(scr).draw(c, W / 2, STAGE_Y + (1 - a_in) * 40 - shrink * 40, S * lerp(1, 0.62, shrink), alpha=a_in * (1 - out4(a_out)))
    sw = out4(phase(t, 42.1, 0.5)) * (1 - inout(phase(t, 46.4, 0.5)))
    if sw > 0:
        pos = persona_pos(t) * (1 - inout(phase(t, 45.9, 0.5)))
        layer = Image.new('RGBA', (W, H), (0, 0, 0, 0)); switch(layer, W / 2, STAGE_Y + 437 * S + 52, 4, pos, PCOL)
        layer.putalpha(layer.getchannel('A').point(lambda v: int(v * sw))); c.alpha_composite(layer)
    tap(c, W / 2 + (68 - 201) * S, STAGE_Y + (722 - 437) * S, phase(t, 46.6, 0.75))

# ---------- scene 6: the library, an endless tilted gallery ----------
GAL = None
def gallery_setup():
    global GAL
    names = ['profile', 'goal', 'chat-food', 'account', 'c3', 'chat-check-trickster', 'transactions', 'notifications', 'send-confirm',
             'c1', 'chat-salary', 'profile-atlas', 'send-pay-from', 'chat-done', 'c4', 'chat-check-caregiver', 'c1-atlas', 'chat-check-analyst', 'c2']
    tile, gx, gy, cols = 300, 46, 46, 8; th = tile * 874 / 402
    strips = []
    for q in range(cols):
        seq = [names[(q * 5 + k) % len(names)] for k in range(5)]; sh = int(len(seq) * (th + gy))
        strip = Image.new('RGBA', (tile + 120, sh * 2 + 200), (0, 0, 0, 0))
        for rep in range(2):
            for k, n in enumerate(seq): Phone(viewport(n)).draw(strip, 60 + tile / 2, 100 + rep * sh + k * (th + gy) + th / 2, tile / 402)
        strips.append((strip, sh))
    PW, PH = cols * (tile + gx) + 200, 2500
    def project(X, Y):
        ang = math.radians(-16); x = X * math.cos(ang) - Y * math.sin(ang); y = X * math.sin(ang) + Y * math.cos(ang)
        tilt = math.radians(40); yz = y * math.cos(tilt); z = y * math.sin(tilt) + 3000
        return (W / 2 + 2100 * x / z, H / 2 + 60 + 2100 * yz / z)
    pc = [(0, 0), (PW, 0), (PW, PH), (0, PH)]
    fog = Image.new('L', (W, H), 0); fd = ImageDraw.Draw(fog)
    for y in range(H): fd.line([(0, y), (W, y)], fill=int(255 * max(0.0, 1 - min(y, H - y) / 330) ** 1.7))
    GAL = (strips, tile, gx, PW, PH, perspective_coeffs(pc, [project(x - PW / 2, y - PH / 2) for x, y in pc]), fog)
def library(c, t):
    a = inout(phase(t, 48.6, 1.8))
    if a <= 0: return
    if GAL is None: gallery_setup()
    strips, tile, gx, PW, PH, coeffs, fog = GAL
    plane = Image.new('RGBA', (PW, PH), BG + (255,))
    for q, (strip, sh) in enumerate(strips):
        off = (t * (30 + (q % 3) * 8) * (1 if q % 2 else -1) + q * 137) % sh
        plane.alpha_composite(strip, (100 + q * (tile + gx) - 60, int(-off) - 100))
    g = plane.transform((W, H), Image.PERSPECTIVE, coeffs, resample=Image.BICUBIC, fillcolor=BG + (255,))
    g.paste(BG + (255,), (0, 0), fog)
    veil = lerp(0.4, 0.16, inout(phase(t, 50.0, 3.0)))
    g.alpha_composite(Image.new('RGBA', (W, H), BG + (int(255 * veil),)))
    if a < 1: g.putalpha(int(255 * a))
    c.alpha_composite(g)

def frame(t):
    c = canvas(W, H)
    library(c, t)
    think_card(c, t); profile_phone(c, t)
    flow(c, t); brand(c, t); assistant(c, t)
    dock(c, t)
    return c

if __name__ == '__main__':
    E.setup(sys.argv[1], sys.argv[2])
    N = int(DUR * FPS)
    first, last = (int(sys.argv[3]), int(sys.argv[4])) if len(sys.argv) > 4 else (0, N)
    only = E.ONLY
    for i in (only or range(first, min(last, N))):
        E.save(frame(i / FPS), 'film', i)
    print('frames', first, last, flush=True)

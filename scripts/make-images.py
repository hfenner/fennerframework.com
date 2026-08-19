#!/usr/bin/env python3
"""Regenerate public/og.png (1200x630 social preview) and public/icons/apple-touch-icon.png.
Pure Pillow, no network. Run: python3 scripts/make-images.py"""
import os
from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.join(os.path.dirname(__file__), '..', 'public')
INK, BG, WOOD, PINE, STEEL = (28, 26, 23), (250, 247, 242), (184, 96, 27), (231, 199, 154), (47, 62, 70)

def font(size, bold=True):
    for p in ['/usr/share/fonts/google-noto/NotoSans-Bold.ttf' if bold else '/usr/share/fonts/google-noto/NotoSans-Regular.ttf',
              '/usr/share/fonts/dejavu-sans-fonts/DejaVuSans-Bold.ttf' if bold else '/usr/share/fonts/dejavu-sans-fonts/DejaVuSans.ttf']:
        if os.path.exists(p):
            return ImageFont.truetype(p, size)
    return ImageFont.load_default()

def frame(d, x, y, w, h):
    """A framed landscape: dark moulding, lip, wide mat, bevel, art."""
    d.rectangle([x, y, x + w, y + h], fill=(143, 71, 19), outline=(92, 45, 10))
    d.rectangle([x + 16, y + 16, x + w - 16, y + h - 16], fill=WOOD, outline=PINE)
    d.rectangle([x + 26, y + 26, x + w - 26, y + h - 26], fill=(251, 248, 241), outline=(230, 220, 200))
    ax, ay, aw, ah = x + 74, y + 70, w - 148, h - 140
    d.rectangle([ax - 4, ay - 4, ax + aw + 4, ay + ah + 4], fill=(236, 227, 210), outline=(216, 203, 178))
    d.rectangle([ax, ay, ax + aw, ay + ah], fill=(219, 231, 238))
    d.polygon([(ax, ay + ah), (ax + aw * .25, ay + ah * .45), (ax + aw * .42, ay + ah * .7), (ax + aw * .58, ay + ah * .35), (ax + aw * .8, ay + ah * .8), (ax + aw, ay + ah * .6), (ax + aw, ay + ah)], fill=STEEL)
    d.ellipse([ax + aw * .72, ay + ah * .14, ax + aw * .72 + 26, ay + ah * .14 + 26], fill=(233, 180, 76))

# --- og.png ---
W, H = 1200, 630
im = Image.new('RGB', (W, H), BG)
d = ImageDraw.Draw(im)
frame(d, 740, 95, 400, 440)
d.rectangle([0, 0, 14, H], fill=WOOD)
d.text((80, 90), 'CUSTOM PICTURE FRAMING', font=font(24), fill=(143, 71, 19))
d.text((76, 140), 'Fenner', font=font(96), fill=INK)
d.text((76, 240), 'Framework', font=font(96), fill=WOOD)
d.text((80, 380), 'Frame it like it matters.', font=font(46), fill=INK)
d.text((80, 440), 'Because it does.', font=font(46), fill=INK)
d.text((80, 530), 'fennerframework.com  ·  Free design consultations', font=font(28, bold=False), fill=STEEL)
im.save(os.path.join(ROOT, 'og.png'), optimize=True)

# --- apple-touch-icon.png ---
S = 180
ic = Image.new('RGB', (S, S), INK)
d = ImageDraw.Draw(ic)
d.rectangle([28, 28, S - 28, S - 28], outline=WOOD, width=16)
d.rectangle([60, 60, S - 60, S - 60], fill=BG)
d.polygon([(66, 114), (84, 88), (96, 102), (108, 80), (120, 114)], fill=STEEL)
ic.save(os.path.join(ROOT, 'icons', 'apple-touch-icon.png'), optimize=True)
print('wrote public/og.png and public/icons/apple-touch-icon.png')

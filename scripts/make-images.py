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

def studs(d, x, y, w, h, bay=64, t=14):
    d.rectangle([x, y, x + w, y + t], fill=PINE, outline=WOOD)
    d.rectangle([x, y + h - t, x + w, y + h], fill=PINE, outline=WOOD)
    sx = x
    while sx + t <= x + w:
        d.rectangle([sx, y + t, sx + t, y + h - t], fill=PINE, outline=WOOD)
        sx += bay
    d.rectangle([x + w - t, y + t, x + w, y + h - t], fill=PINE, outline=WOOD)

# --- og.png ---
W, H = 1200, 630
im = Image.new('RGB', (W, H), BG)
d = ImageDraw.Draw(im)
studs(d, 760, 60, 380, 510, bay=76, t=16)
d.rectangle([0, 0, 14, H], fill=WOOD)
d.text((80, 90), 'RESIDENTIAL FRAMING CONTRACTOR', font=font(24), fill=(143, 71, 19))
d.text((76, 140), 'Fenner', font=font(96), fill=INK)
d.text((76, 240), 'Framework', font=font(96), fill=WOOD)
d.text((80, 380), 'Straight. Square. Plumb.', font=font(46), fill=INK)
d.text((80, 440), 'Every time.', font=font(46), fill=INK)
d.text((80, 530), 'fennerframework.com  ·  Free estimates', font=font(28, bold=False), fill=STEEL)
im.save(os.path.join(ROOT, 'og.png'), optimize=True)

# --- apple-touch-icon.png ---
S = 180
ic = Image.new('RGB', (S, S), INK)
d = ImageDraw.Draw(ic)
d.rounded_rectangle([26, 26, S - 26, S - 26], radius=10, outline=WOOD, width=12)
for x in (62, 90, 118):
    d.rectangle([x - 6, 38, x + 6, S - 38], fill=PINE)
d.rectangle([38, 84, S - 38, 96], fill=PINE)
ic.save(os.path.join(ROOT, 'icons', 'apple-touch-icon.png'), optimize=True)
print('wrote public/og.png and public/icons/apple-touch-icon.png')

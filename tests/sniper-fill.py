# The sniper's solid silhouette, for a grey fill under the ink: the ink with its gaps closed and holes filled. Same frame as rifle.py.
import numpy as np, potrace, json
from PIL import Image, ImageFilter, ImageDraw
im = Image.open('/home/user/brawlwinism/reference/sniper-ink.webp').convert('L'); S = 2
g = im.resize((im.width * S, im.height * S), Image.LANCZOS)
ink = Image.fromarray(((np.array(g) < 128) * 255).astype(np.uint8))
ink = ink.filter(ImageFilter.MaxFilter(1 + 2 * 8)).filter(ImageFilter.MaxFilter(1 + 2 * 5)).filter(ImageFilter.MinFilter(1 + 2 * 8)).filter(ImageFilter.MinFilter(1 + 2 * 5))
a = np.array(ink) > 127
out = Image.fromarray((~a * 255).astype(np.uint8)).copy(); ImageDraw.floodfill(out, (0, 0), 128)
solid = np.array(out) != 128
solid = np.array(Image.fromarray((solid * 255).astype(np.uint8)).filter(ImageFilter.MinFilter(1 + 2 * 3))) > 127   # pulled in a little, inside the ink
pl = potrace.Bitmap(~solid).trace(turdsize=200 * S * S, alphamax=1.0, opticurve=True, opttolerance=0.4)
GX, GY, MX = 360.0, 300.0, 1976.0; sc = 92.0 / (MX - GX)
P = lambda p: f"{(p.x / S - GX) * sc:.1f},{(p.y / S - GY) * sc:.1f}"
d = []
for c in pl:
    d.append('M' + P(c.start_point))
    for s in c.segments: d.append(('L' + P(s.c) + 'L' + P(s.end_point)) if s.is_corner else ('C' + P(s.c1) + ' ' + P(s.c2) + ' ' + P(s.end_point)))
    d.append('Z')
json.dump({'fill': ''.join(d)}, open('riflefill.json', 'w')); print(len(pl), 'shapes', len(''.join(d)))
Image.fromarray((solid * 255).astype(np.uint8)).resize(im.size).save('/home/user/brawlwinism/tests/out/sniper-solid.png')

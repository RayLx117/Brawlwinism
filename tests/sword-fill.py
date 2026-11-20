# How the sword fill (SWORD.fill in index.html) was made from reference/sword-ink.png. Needs: pip install potracer.
# The sword's solid silhouette, for a pale fill under the ink: the ink mask with its gaps closed and holes filled, splatter dropped.
import numpy as np, potrace, json, re
from PIL import Image, ImageFilter, ImageDraw
im = Image.open('/home/user/brawlwinism/reference/sword-ink.png').convert('RGBA')
bg = Image.new('RGBA', im.size, (255,255,255,255)); bg.alpha_composite(im)
S = 3
g = bg.convert('L').resize((im.width*S, im.height*S), Image.LANCZOS)
ink = Image.fromarray(((np.array(g) < 128) * 255).astype(np.uint8))
d = ImageDraw.Draw(ink); d.rectangle([880*S, 330*S, im.width*S, im.height*S], fill=0)   # the stray mark
ink = ink.filter(ImageFilter.MaxFilter(1 + 2 * 9)).filter(ImageFilter.MaxFilter(1 + 2 * 6)).filter(ImageFilter.MinFilter(1 + 2 * 9)).filter(ImageFilter.MinFilter(1 + 2 * 6))   # close gaps between strokes
# fill holes: flood the outside from a corner, everything not reached is inside
a = np.array(ink) > 127
out = Image.fromarray((~a * 255).astype(np.uint8)).copy(); ImageDraw.floodfill(out, (0, 0), 128)
solid = np.array(out) != 128
# the tassel is cloth, not the sword: no fill below the pommel's ring (source px y > 120, x > 900)
solid[int(120*S):, int(900*S):] = False
# the guard is a disc, drawn as a broken ring: fill it in, tilted with the sword
import math
gim = Image.fromarray((solid * 255).astype(np.uint8)).copy(); gd = ImageDraw.Draw(gim)
cx, cy, rx, ry, rot = 722 * S, 190 * S, 26 * S, 74 * S, math.radians(-14)
gd.polygon([(cx + rx * math.cos(t) * math.cos(rot) - ry * math.sin(t) * math.sin(rot), cy + rx * math.cos(t) * math.sin(rot) + ry * math.sin(t) * math.cos(rot)) for t in [i / 48 * 2 * math.pi for i in range(48)]], fill=255)
gim = gim.filter(ImageFilter.MinFilter(1 + 2 * 6))   # pull the fill in a little so it stays inside the ink edges
solid = np.array(gim) > 127
bm = potrace.Bitmap(~solid)
pl = bm.trace(turdsize=400*S*S, alphamax=1.0, opticurve=True, opttolerance=0.4)
TIP, GUARD, POM = np.array([38., 316.]), np.array([724., 196.]), np.array([1006., 84.])
ax = (GUARD - POM); ax /= np.linalg.norm(ax); sc = 40.0 / np.linalg.norm(TIP - GUARD); nx = np.array([-ax[1], ax[0]])
def T(p):
    p = np.array([p.x, p.y]) / S - GUARD
    return f"{float(p @ nx) * sc:.1f},{23.5 + 4.0 + float(p @ ax) * sc:.1f}"
dd = []
for c in pl:
    dd.append('M' + T(c.start_point))
    for s in c.segments:
        dd.append(('L' + T(s.c) + 'L' + T(s.end_point)) if s.is_corner else ('C' + T(s.c1) + ' ' + T(s.c2) + ' ' + T(s.end_point)))
    dd.append('Z')
D = ''.join(dd); print(len(pl), 'shapes', len(D), 'chars')
json.dump({'fill': D}, open('swordfill.json', 'w'))
Image.fromarray((solid * 255).astype(np.uint8)).resize(im.size).save('/home/user/brawlwinism/tests/out/sword-solid.png')

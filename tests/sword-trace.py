# How the sword asset was traced: reference/sword-ink.png -> potrace (pip install potracer) -> the SWORD.d path in index.html and reference/sword-trace.svg.
import numpy as np, potrace, json
from PIL import Image
im = Image.open('/home/user/brawlwinism/reference/sword-ink.png').convert('RGBA')
bg = Image.new('RGBA', im.size, (255,255,255,255)); bg.alpha_composite(im)
g = bg.convert('L'); S = 3
g = g.resize((g.width*S, g.height*S), Image.LANCZOS)
a = np.array(g) >= 128   # potracer traces the False pixels, so ink is False
# drop the stray mark at the bottom right corner of the sheet (not part of the sword)
a[int(330*S):, int(880*S):] = True
bm = potrace.Bitmap(a)
pl = bm.trace(turdsize=6*S*S, alphamax=1.0, opticurve=True, opttolerance=0.2)
# landmarks (source px): the blade's tip, the guard's centre, the pommel's end
TIP, GUARD, POM = np.array([38., 316.]), np.array([724., 196.]), np.array([1006., 84.])
# local sword space: guard centre -> (0, 23.5), handle runs toward -y, blade toward +y; scale so guard-to-tip is the blade length (40)
blade_len = 40.0
ax = (GUARD - POM); ax /= np.linalg.norm(ax)          # along the sword, pommel -> blade
sc = blade_len / np.linalg.norm(TIP - GUARD)
nx = np.array([-ax[1], ax[0]])
def T(p):
    p = (np.array([p[0], p[1]]) if not hasattr(p, "x") else np.array([p.x, p.y])) / S - GUARD
    return (round(float(p @ nx) * sc, 2), round(23.5 + float(p @ ax) * sc, 2))
d = []
for c in pl:
    x, y = T(c.start_point); d.append(f'M{x},{y}')
    for s in c.segments:
        if s.is_corner:
            a1 = T(s.c); b1 = T(s.end_point); d.append(f'L{a1[0]},{a1[1]}L{b1[0]},{b1[1]}')
        else:
            c1 = T(s.c1); c2 = T(s.c2); e = T(s.end_point); d.append(f'C{c1[0]},{c1[1]} {c2[0]},{c2[1]} {e[0]},{e[1]}')
    d.append('Z')
D = ''.join(d)
tip = T(TIP * S)
print(len(pl), 'curves', len(D), 'chars', 'tip', tip, 'pommel', T(POM * S), 'scale', sc)
json.dump({'d': D, 'tip': tip}, open('sword.json', 'w'))
# a standalone SVG of the trace in source coordinates, for reference
dd = []
for c in pl:
    P = lambda p: (p.x, p.y)
    x, y = P(c.start_point); dd.append(f'M{x/S:.1f},{y/S:.1f}')
    for s in c.segments:
        if s.is_corner: dd.append(f'L{P(s.c)[0]/S:.1f},{P(s.c)[1]/S:.1f}L{P(s.end_point)[0]/S:.1f},{P(s.end_point)[1]/S:.1f}')
        else: dd.append(f'C{P(s.c1)[0]/S:.1f},{P(s.c1)[1]/S:.1f} {P(s.c2)[0]/S:.1f},{P(s.c2)[1]/S:.1f} {P(s.end_point)[0]/S:.1f},{P(s.end_point)[1]/S:.1f}')
    dd.append('Z')
open('/home/user/brawlwinism/reference/sword-trace.svg','w').write(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {im.width} {im.height}"><path fill="#15120f" fill-rule="evenodd" d="{"".join(dd)}"/></svg>\n')

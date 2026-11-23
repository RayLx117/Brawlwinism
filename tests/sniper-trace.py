# Traces Ray's sniper drawing (reference/sniper-ink.webp) to the rifle path: grip (the hand) at the origin, barrel along +x, the
# muzzle at x = 92 (rifle units; the game scales it by NOSCOPE.scale). Also writes reference/sniper-trace.svg.
import numpy as np, potrace, json
from PIL import Image
im = Image.open('/home/user/brawlwinism/reference/sniper-ink.webp').convert('L'); S = 2
g = im.resize((im.width * S, im.height * S), Image.LANCZOS)
ink = np.array(g) >= 128                       # potracer traces the False pixels: ink is False
pl = potrace.Bitmap(ink).trace(turdsize=10 * S * S, alphamax=1.0, opticurve=True, opttolerance=0.2)
GX, GY, MX = 360.0, 300.0, 1976.0; sc = 92.0 / (MX - GX)
P = lambda p: f"{(p.x / S - GX) * sc:.1f},{(p.y / S - GY) * sc:.1f}"
Q = lambda p: f"{p.x / S:.1f},{p.y / S:.1f}"
def path(T):
    d = []
    for c in pl:
        d.append('M' + T(c.start_point))
        for s in c.segments: d.append(('L' + T(s.c) + 'L' + T(s.end_point)) if s.is_corner else ('C' + T(s.c1) + ' ' + T(s.c2) + ' ' + T(s.end_point)))
        d.append('Z')
    return ''.join(d)
D = path(P); json.dump({'d': D}, open('rifle.json', 'w'))
open('/home/user/brawlwinism/reference/sniper-trace.svg', 'w').write(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {im.width} {im.height}"><path fill="#15120f" d="{path(Q)}"/></svg>\n')
print(len(pl), 'curves', len(D), 'chars')

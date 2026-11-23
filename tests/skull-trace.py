# Traces Ray's red skull (reference/skull-ink.webp) to the death icon's path: centred on the skull's bounding box, 100 units wide
# (the game scales it by DEATH.size). Writes the path to skull.json (paste into SKULL_PATH) and reference/skull-trace.svg.
import numpy as np, potrace, json
from PIL import Image
im = Image.open('/home/user/brawlwinism/reference/skull-ink.webp').convert('RGBA'); S = 1
a = np.array(im).astype(int)
ink0 = (a[:, :, 3] >= 128) & (a[:, :, 0] - a[:, :, 1] > 60)   # the red ink: opaque (the background is transparent) and red
ys, xs = np.nonzero(ink0); x0, x1, y0, y1 = xs.min(), xs.max(), ys.min(), ys.max()
cx, cy, sc = (x0 + x1) / 2, (y0 + y1) / 2, 100.0 / (x1 - x0)
m = Image.fromarray((~ink0 * 255).astype(np.uint8)).resize((im.width * S, im.height * S), Image.LANCZOS)
ink = np.array(m) >= 128                        # potracer traces the False pixels: ink is False
pl = potrace.Bitmap(ink).trace(turdsize=8, alphamax=1.0, opticurve=True, opttolerance=0.5)
P = lambda p: f"{(p.x / S - cx) * sc:.1f},{(p.y / S - cy) * sc:.1f}"
Q = lambda p: f"{p.x / S:.1f},{p.y / S:.1f}"
def path(T):
    d = []
    for c in pl:
        d.append('M' + T(c.start_point))
        for s in c.segments: d.append(('L' + T(s.c) + 'L' + T(s.end_point)) if s.is_corner else ('C' + T(s.c1) + ' ' + T(s.c2) + ' ' + T(s.end_point)))
        d.append('Z')
    return ''.join(d)
D = path(P); json.dump({'d': D, 'h': float((y1 - y0) * sc)}, open('skull.json', 'w'))
open('/home/user/brawlwinism/reference/skull-trace.svg', 'w').write(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {im.width} {im.height}"><path fill="#a00808" d="{path(Q)}"/></svg>\n')
print(len(pl), 'curves', len(D), 'chars', 'height', (y1 - y0) * sc)

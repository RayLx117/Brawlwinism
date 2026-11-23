// Exports the in-game sword (traced ink + pale fill + solid outline, as drawn in the hand) as a large transparent PNG:
// exports/sword.png, blade pointing right. Reads SWORD.d / SWORD.fill straight out of index.html.
const { chromium } = require('playwright'); const path = require('path'), fs = require('fs');
const src = fs.readFileSync(path.resolve(__dirname, '../index.html'), 'utf8');
const d = src.match(/SWORD = \{[^}]*?d: '([^']+)'/)[1], fill = src.match(/SWORD\.fill = '([^']+)'/)[1], col = src.match(/SWORD_FILL_COL = '([^']+)'/)[1];
const OUTLINE = 0.75, K = 30;   // outline in sword units (1.6 game px at the in-hand size); px per sword unit
(async () => {
  const b = await chromium.launch(); const p = await b.newPage(); await p.setContent('<canvas id=c></canvas>');
  const url = await p.evaluate(([d, fill, col, OUTLINE, K]) => {
    const P = new Path2D(d), F = new Path2D(fill);
    // bounds, by sampling the paths on a probe canvas
    const pc = document.createElement('canvas'); pc.width = pc.height = 10; const g = pc.getContext('2d');
    let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
    for (let y = -20; y < 90; y += 0.25) for (let x = -30; x < 30; x += 0.25) if (g.isPointInPath(P, x, y) || g.isPointInPath(F, x, y)) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
    const pad = 2, W = Math.ceil((y1 - y0 + 2 * pad) * K), H = Math.ceil((x1 - x0 + 2 * pad) * K);
    const c = document.getElementById('c'); c.width = W; c.height = H; const ctx = c.getContext('2d');
    // blade pointing right: sword +y -> screen +x; sword x -> screen y
    ctx.setTransform(0, K, K, 0, -(y0 - pad) * K, -(x0 - pad) * K);
    ctx.lineJoin = 'round'; ctx.strokeStyle = '#15120f'; ctx.lineWidth = 2 * OUTLINE; ctx.stroke(F);
    ctx.fillStyle = col; ctx.fill(F); ctx.fillStyle = '#15120f'; ctx.fill(P);
    return c.toDataURL('image/png');
  }, [d, fill, col, OUTLINE, K]);
  fs.writeFileSync(path.resolve(__dirname, '../exports/sword.png'), Buffer.from(url.split(',')[1], 'base64'));
  await b.close();
})();

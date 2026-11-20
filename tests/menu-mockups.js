// Main-menu mockups: still frames of candidate backgrounds behind the real brush title and menu, in the game's ink style.
// Pulls the game's own helpers (rng, noise, catmull, brushPath, bristleStroke, GLYPHS, buildTitle) out of index.html and
// paints each concept on a fresh canvas. Writes out/menu-mock-<name>.png and a 2x2 sheet out/menu-mockups.png.
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs'), { execSync } = require('child_process');
const OUT = path.join(__dirname, 'out') + '/'; fs.mkdirSync(OUT, { recursive: true });
const src = fs.readFileSync(path.resolve(__dirname, '../index.html'), 'utf8');
const grab = (re, name) => { const m = src.match(re); if (!m) throw new Error('could not find ' + name); return m[0]; };
const HELPERS = [
  grab(/  function rng\([\s\S]*?\n/, 'rng'),
  grab(/  function vnoise[\s\S]*?\n  }\n/, 'vnoise'),
  grab(/  function catmull[\s\S]*?\n  }\n/, 'catmull'),
  grab(/  function brushPath[\s\S]*?\n  }\n/, 'brushPath'),
  grab(/  function bristleStroke[\s\S]*?\n    return \{ body, hairs \};\n  }\n/, 'bristleStroke'),
  grab(/  const GLYPHS = \{[\s\S]*?\n  \};\n/, 'GLYPHS'),
  grab(/  function buildTitle[\s\S]*?\n    return \{ body, hairs, spat, w: W, x0 \};\n  }\n/, 'buildTitle'),
].join('\n');

const PAGE = (concept) => `<!doctype html><body style="margin:0;background:#000"><canvas id=c width=2560 height=1440 style="width:1280px;height:720px"></canvas><script>
const TAU = Math.PI * 2, GW = 1280, GH = 720, INK = '#15120f';
${HELPERS}
const cv = document.getElementById('c'), ctx = cv.getContext('2d'); ctx.scale(2, 2);
const rgba = (c, a) => 'rgba(' + c.join(',') + ',' + a + ')';
// paper: a flat sheet in the scene's tint, with grain and laid lines
function paper(col) {
  ctx.fillStyle = 'rgb(' + col.join(',') + ')'; ctx.fillRect(0, 0, GW, GH);
  const r = rng(41); ctx.fillStyle = 'rgba(90,70,45,0.05)';
  for (let i = 0; i < 9000; i++) ctx.fillRect(r() * GW, r() * GH, 0.8, 0.8);
  ctx.fillStyle = 'rgba(90,70,45,0.03)'; for (let x = 0; x < GW; x += 2) ctx.fillRect(x, 0, 0.5, GH);
}
// painting in layers: draw a shape opaque on a scratch canvas, then lay it on at an alpha (optionally softened, for wet-in-wet
// edges). Overlaps inside one layer don't double up, the way a single wash doesn't.
function layer(fn, a, blur = 0) {
  const L = document.createElement('canvas'); L.width = 2560; L.height = 1440; const g = L.getContext('2d'); g.scale(2, 2); fn(g);
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = a; if (blur) ctx.filter = 'blur(' + blur * 2 + 'px)'; ctx.drawImage(L, 0, 0); ctx.restore();
}
function blob(x, y, rx, ry, seed, k = 1) {
  const n = vnoise(6, seed), n2 = vnoise(15, seed + 5), p = new Path2D();
  for (let i = 0; i <= 90; i++) { const t = i / 90, an = t * TAU, rr = (0.74 + 0.38 * n(t, 0.31) + 0.1 * n2(t, 0.71)) * k; const px = x + Math.cos(an) * rx * rr, py = y + Math.sin(an) * ry * rr; i ? p.lineTo(px, py) : p.moveTo(px, py); }
  p.closePath(); return p;
}
// a watercolour wash: a soft wet body, a second smaller pass of pigment pooling inside it, a crisp darker tide line along part
// of the edge where it dried, and pigment granulation
function wash(x, y, rx, ry, col, a, seed) {
  layer(g => { g.fillStyle = rgba(col, 1); g.fill(blob(x, y, rx, ry, seed)); }, a, Math.max(4, rx * 0.035));
  layer(g => { g.fillStyle = rgba(col, 1); g.fill(blob(x + rx * 0.05, y + ry * 0.04, rx, ry, seed + 9, 0.72)); }, a * 0.6, Math.max(3, rx * 0.025));
  const n = vnoise(6, seed), n2 = vnoise(15, seed + 5), r = rng(seed + 3), dark = col.map(v => v * 0.7);
  for (let s0 = 0; s0 < 3; s0++) {   // a few lengths of tide line, not the whole edge
    const a0 = r() * TAU, len = 0.35 + r() * 0.5, pts = [];
    for (let i = 0; i <= 24; i++) { const t = (a0 + len * i / 24) / TAU, an = t * TAU, rr = 0.74 + 0.38 * n(((t % 1) + 1) % 1, 0.31) + 0.1 * n2(((t % 1) + 1) % 1, 0.71); pts.push([x + Math.cos(an) * rx * rr, y + Math.sin(an) * ry * rr]); }
    ctx.fillStyle = rgba(dark, a * 0.7); ctx.fill(brushPath(pts.map(([px, py]) => [x + (px - x) * 0.93, y + (py - y) * 0.93]), 1.3, 0.35, 0.35, 0.3, seed + 20 + s0));
  }
  ctx.fillStyle = rgba(dark, a * 1.2);
  for (let i = 0; i < rx * ry / 180; i++) { const an = r() * TAU, d = Math.sqrt(r()) * 0.85; ctx.fillRect(x + Math.cos(an) * rx * d, y + Math.sin(an) * ry * d, 0.7 + r() * 0.6, 0.7); }
}
// floating ink motes (soft dots) scattered over an area
function motes(n, col, a, seed, area = [0, 0, GW, GH], size = [0.8, 2.4]) {
  const r = rng(seed);
  for (let i = 0; i < n; i++) { ctx.fillStyle = rgba(col, a * (0.4 + r() * 0.6)); ctx.beginPath(); ctx.arc(area[0] + r() * area[2], area[1] + r() * area[3], size[0] + r() * (size[1] - size[0]), 0, TAU); ctx.fill(); }
}
// the real menu: brush title, its underline, the selected item and the hint
function menu(textCol = 'rgba(21,18,15,0.5)') {
  const T = buildTitle(GW / 2, 270); ctx.fillStyle = INK; ctx.fill(T.body); ctx.fill(T.hairs); ctx.fill(T.spat);
  const tw = T.w, l = T.x0;
  ctx.fill(brushPath([[l - 10, 300], [l + tw * 0.35, 303], [l + tw * 0.75, 299], [l + tw + 14, 301]], 13, 0.03, 0.45, 0.8, 901));
  const r = rng(905);
  for (let h = 0; h < 6; h++) { const y = 296 + h * 1.9, x0 = l + tw * (0.62 + r() * 0.1); ctx.fill(brushPath([[x0, y], [l + tw + 30 + r() * 30, y + (r() - 0.5) * 3], [l + tw + 50 + r() * 50, y + (r() - 0.3) * 5]], 1.3, 0.05, 0.6, 0.1, 910 + h)); }
  ctx.textAlign = 'center'; ctx.font = 'italic 700 32px Georgia, serif'; ctx.fillStyle = INK; ctx.fillText('Practice Tool', GW / 2, 440);
  const w = ctx.measureText('Practice Tool').width;
  ctx.fill(brushPath([[GW / 2 - w / 2 - 4, 450], [GW / 2, 451], [GW / 2 + w / 2 + 4, 449]], 4, 0.05, 0.55, 0.3, 920));
  ctx.fill(brushPath([[GW / 2 - w / 2 - 32, 424], [GW / 2 - w / 2 - 20, 430], [GW / 2 - w / 2 - 32, 436]], 5, 0.1, 0.4, 0.2, 930));
  ctx.font = 'italic 500 17px Georgia, serif'; ctx.fillStyle = textCol; ctx.fillText('Enter, Space or A to start', GW / 2, 640);
}
const CONCEPTS = {
  // A: ink dropped in water: soft clouds of dull indigo ink billowing up from below and drifting, fine tendrils curling off them
  bloom() {
    paper([228, 230, 225]);
    wash(140, 660, 430, 210, [78, 96, 116], 0.2, 3); wash(1190, 70, 380, 190, [78, 96, 116], 0.15, 4); wash(1170, 690, 300, 150, [104, 90, 118], 0.15, 5);
    const plume = (x0, y0, dx, rise, col, seed, sz = 1) => {
      const r = rng(seed), C = [];
      for (let i = 0; i <= 30; i++) { const t = i / 30; C.push([x0 + dx * t + Math.sin(t * 6 + seed) * 46 * t, y0 - rise * t]); }
      layer(g => {   // the body of the cloud: overlapping puffs, darkest low where it's dense, opening out as it rises
        for (let i = 0; i < 70; i++) { const t = r() ** 0.8, [x, y] = C[Math.round(t * 30)], s = (18 + 110 * t) * sz;
          g.fillStyle = rgba(col.map(v => v + 60 * t), 1); g.beginPath(); g.ellipse(x + (r() - 0.5) * s * 1.1, y + (r() - 0.5) * s * 0.6, s * (0.6 + r() * 0.5), s * (0.4 + r() * 0.3), r() * 3, 0, TAU); g.fill(); }
      }, 0.34, 7);
      layer(g => { for (let i = 0; i < 40; i++) { const t = r() ** 1.4, [x, y] = C[Math.round(t * 30)], s = (10 + 50 * t) * sz; g.fillStyle = rgba(col, 1); g.beginPath(); g.ellipse(x + (r() - 0.5) * s, y + (r() - 0.5) * s * 0.5, s * 0.6, s * 0.4, r() * 3, 0, TAU); g.fill(); } }, 0.26, 3);
      for (let k = 0; k < 6; k++) {   // fine tendrils curling off the edges
        const pts = [], ph = r() * 6, side = r() < 0.5 ? -1 : 1;
        for (let j = 0; j <= 10; j++) { const t = 0.2 + 0.75 * j / 10, [x, y] = C[Math.round(t * 30)]; pts.push([x + side * (20 + 70 * t) * sz + Math.sin(t * 9 + ph) * 26 * t, y - 20 * t]); }
        ctx.fillStyle = rgba(col, 0.3); ctx.fill(brushPath(pts.slice(0, 7 + (k % 4)), 0.9 + r() * 1.1, 0.25, 0.7, 0.2, seed + k));
      }
    };
    plume(230, 760, 240, 620, [40, 54, 72], 11); plume(1070, 760, -200, 540, [58, 50, 74], 17); plume(660, 780, 50, 300, [40, 54, 72], 23, 0.7);
    motes(60, [40, 50, 66], 0.35, 7);
    menu();
  },
  // B: the Divine General's wheel: a huge faint gold dharma wheel (it would turn very slowly), warm sepia washes, gold flecks and ash rising
  wheel() {
    paper([234, 224, 203]);
    wash(150, 110, 430, 250, [178, 140, 84], 0.16, 31); wash(1130, 650, 470, 250, [152, 100, 72], 0.14, 32); wash(1170, 110, 250, 150, [178, 140, 84], 0.1, 33);
    const cx = GW / 2, cy = 300, R = 285, G = [196, 150, 52];
    layer(g => {
      const gold = (pts, w, seed) => { g.fillStyle = rgba(G, 1); g.fill(brushPath(pts, w, 0.08, 0.3, w * 0.12, seed)); };
      const arc = (r, a0, a1) => Array.from({ length: 30 }, (_, i) => { const a = a0 + (a1 - a0) * i / 29; return [cx + Math.cos(a) * r, cy + Math.sin(a) * r]; });
      gold(arc(R, -0.2, 3.3), 26, 40); gold(arc(R, 3.1, 6.3), 24, 41); gold(arc(R * 0.82, 0.2, TAU - 0.1), 9, 42);
      for (let i = 0; i < 8; i++) { const a = 0.25 + i * Math.PI / 4; gold([[cx + Math.cos(a) * 46, cy + Math.sin(a) * 46], [cx + Math.cos(a) * R * 0.6, cy + Math.sin(a) * R * 0.6], [cx + Math.cos(a) * R * 0.98, cy + Math.sin(a) * R * 0.98]], 13, 50 + i);
        gold([[cx + Math.cos(a) * R * 1.02, cy + Math.sin(a) * R * 1.02], [cx + Math.cos(a) * R * 1.1, cy + Math.sin(a) * R * 1.1]], 6, 60 + i);
        g.beginPath(); g.arc(cx + Math.cos(a) * R * 1.15, cy + Math.sin(a) * R * 1.15, 12, 0, TAU); g.fill(); }
      g.beginPath(); g.arc(cx, cy, 44, 0, TAU); g.fill();
    }, 0.32, 0.6);
    motes(80, G, 0.6, 61, [0, 120, GW, GH - 120], [0.8, 2.6]); motes(50, [70, 56, 44], 0.3, 62, [0, 0, GW, GH], [0.6, 1.6]);
    menu('rgba(60,40,20,0.55)');
  },
  // C: misty ink mountains: sumi-e ridges with dry-brush crests, each fading down into mist, a dull red sun, a few birds
  mountains() {
    paper([230, 230, 224]);
    layer(g => { g.fillStyle = 'rgb(168,86,62)'; g.beginPath(); g.arc(975, 205, 66, 0, TAU); g.fill(); }, 0.32, 1.5);
    const ridge = (base, amp, col, a, seed, line, mist) => {
      const n = vnoise(5, seed), n2 = vnoise(19, seed + 3), top = [];
      for (let x = -40; x <= GW + 40; x += 6) { const u = (x + 40) / (GW + 80), y = base - amp * (0.55 * n(u, 0.5) + 0.3 * n2(u, 0.2) + 0.15 * Math.abs(Math.sin(u * 8 + seed))); top.push([x, y]); }
      layer(g => { const p = new Path2D(); p.moveTo(-40, GH + 40); top.forEach(([x, y]) => p.lineTo(x, y)); p.lineTo(GW + 40, GH + 40); p.closePath(); g.fillStyle = rgba(col, 1); g.fill(p); }, a, 1);
      layer(g => { g.fillStyle = 'rgb(232,232,226)'; g.fillRect(-40, base + mist[0], GW + 80, mist[1]); }, 0.85, mist[1] * 0.45);   // mist rising off its foot
      const st = bristleStroke(top.filter((_, i) => i % 4 === 0), line, seed + 9, { dry: 0.8 });
      ctx.fillStyle = rgba(col.map(v => v * 0.55), Math.min(1, a * 1.3)); ctx.fill(st.body); ctx.fill(st.hairs);
    };
    ridge(470, 230, [172, 180, 188], 0.55, 71, 3, [20, 120]); ridge(575, 210, [128, 140, 154], 0.6, 72, 4, [10, 120]);
    ridge(670, 170, [92, 104, 120], 0.66, 75, 5, [10, 110]); ridge(780, 130, [60, 66, 76], 0.75, 77, 6, [0, 100]);
    const r = rng(81); ctx.fillStyle = 'rgba(40,40,44,0.65)';
    for (let i = 0; i < 6; i++) { const x = 830 + r() * 250, y = 140 + r() * 90, s = 6 + r() * 6; ctx.fill(brushPath([[x - s, y - s * 0.2], [x - s * 0.45, y - s * 0.55], [x, y]], 1.7, 0.1, 0.2, 0, 90 + i)); ctx.fill(brushPath([[x, y], [x + s * 0.4, y - s * 0.6], [x + s, y - s * 0.35]], 1.5, 0.1, 0.5, 0, 100 + i)); }
    menu();
  },
  // D: the ensō: one huge dry-brush circle in dull rust behind the title (it would breathe and turn very slowly), splashes, faint washes
  enso() {
    paper([236, 228, 211]);
    wash(120, 660, 380, 200, [124, 74, 58], 0.12, 111); wash(1180, 80, 340, 190, [96, 84, 72], 0.1, 112);
    const pts = []; for (let i = 0; i <= 44; i++) { const a = 2.15 - i / 44 * 5.5, rr = 268 + Math.sin(a * 2.3) * 10; pts.push([GW / 2 + 10 + Math.cos(a) * rr * 1.1, 300 + Math.sin(a) * rr]); }
    const st = bristleStroke(pts, 70, 124, { dry: 0.6 });
    layer(g => { g.fillStyle = 'rgb(140,58,44)'; g.fill(st.body); g.fill(st.hairs); }, 0.7);
    const r = rng(130); ctx.fillStyle = 'rgba(140,58,44,0.65)';
    for (let i = 0; i < 16; i++) { const a = 2.3 + r() * 0.6, d = 300 + r() * 110; ctx.beginPath(); ctx.ellipse(GW / 2 + Math.cos(a) * d * 1.1, 300 + Math.sin(a) * d, 1.4 + r() * 4.5, 1.2 + r() * 3.5, r() * 3, 0, TAU); ctx.fill(); }
    motes(50, [70, 44, 34], 0.3, 131);
    menu();
  },
};
CONCEPTS['${concept}']();
window.__done = true;
</script>`;

(async () => {
  const b = await chromium.launch(), errs = [];
  const names = ['bloom', 'wheel', 'mountains', 'enso'], files = [];
  for (const n of names) {
    const p = await b.newPage({ viewport: { width: 1280, height: 720 } }); p.on('pageerror', e => errs.push(n + ': ' + e.message));   // a fresh page each, so their scripts don't collide
    await p.setContent(PAGE(n)); await p.waitForFunction(() => window.__done, null, { timeout: 20000 });
    const f = OUT + `menu-mock-${n}.png`; await p.screenshot({ path: f }); files.push(f); await p.close();
  }
  execSync(`python3 ${__dirname}/grid.py ${OUT}menu-mockups.png 2 1 ${files.join(' ')}`);
  console.log('errors', errs); await b.close();
})();

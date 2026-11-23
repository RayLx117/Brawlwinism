// Golden traces: scripted keyboard input through fixed scenarios, recording the player's and the bot's state every frame, so a
// restructure can be checked against the build before it ("does it still play the same?").
//   node golden.js record [file]   -> writes golden/<name>.json from that build (default ../index.html, name 'before')
//   node golden.js compare [file] [base]  -> runs the build and compares with golden/<base>.json (default before): per scenario, the largest difference
// Math.random is replaced by a seeded generator so runs repeat exactly.
const { chromium } = require('playwright'); const path = require('path'), fs = require('fs');
const mode = process.argv[2] || 'compare', file = path.resolve(__dirname, process.argv[3] || '../index.html'), name = process.argv[4] || 'before';   // (compare: name = the baseline)
// each scenario: setup (loadout, positions, bot mode), then a timeline of [frame, 'd'|'u', code], run for `frames`
const SC = {
  move: { frames: 260, bot: 1100, steps: [[0, 'd', 'KeyD'], [40, 'd', 'Space'], [52, 'u', 'Space'], [70, 'd', 'Space'], [74, 'u', 'Space'], [90, 'd', 'KeyS'], [96, 'u', 'KeyS'], [110, 'u', 'KeyD'],
    [120, 'd', 'KeyA'], [124, 'd', 'ShiftLeft'], [126, 'u', 'ShiftLeft'], [140, 'd', 'KeyS'], [160, 'u', 'KeyS'], [170, 'u', 'KeyA'], [180, 'd', 'Space'], [190, 'u', 'Space'], [196, 'd', 'KeyD'], [197, 'd', 'KeyW'], [198, 'd', 'ShiftLeft'], [200, 'u', 'ShiftLeft'], [202, 'u', 'KeyW'], [230, 'u', 'KeyD']] },
  wall: { frames: 220, x: 1000, bot: 300, steps: [[0, 'd', 'KeyD'], [20, 'd', 'Space'], [34, 'u', 'Space'], [90, 'd', 'Space'], [96, 'u', 'Space'], [140, 'u', 'KeyD']] },
  fists: { frames: 300, x: 420, bot: 520, botDmg: 30, steps: [[0, 'd', 'KeyJ'], [1, 'u', 'KeyJ'], [16, 'd', 'KeyJ'], [17, 'u', 'KeyJ'], [34, 'd', 'KeyJ'], [35, 'u', 'KeyJ'],
    [120, 'd', 'KeyJ'], [121, 'u', 'KeyJ'], [137, 'd', 'KeyJ'], [138, 'u', 'KeyJ'], [154, 'd', 'KeyD'], [155, 'd', 'KeyJ'], [156, 'u', 'KeyJ'], [170, 'u', 'KeyD'], [230, 'd', 'Space'], [236, 'u', 'Space'], [244, 'd', 'KeyJ'], [245, 'u', 'KeyJ']] },
  spin: { frames: 160, x: 420, bot: 515, botDmg: 60, steps: [[0, 'd', 'KeyJ'], [1, 'u', 'KeyJ'], [18, 'd', 'KeyJ'], [19, 'u', 'KeyJ'], [36, 'd', 'KeyS'], [37, 'd', 'KeyJ'], [38, 'u', 'KeyJ'], [60, 'u', 'KeyS']] },
  sword: { frames: 260, x: 420, bot: 540, botDmg: 30, sword: true, steps: [[0, 'd', 'KeyJ'], [1, 'u', 'KeyJ'], [8, 'd', 'KeyJ'], [9, 'u', 'KeyJ'], [130, 'd', 'KeyD'], [131, 'd', 'ShiftLeft'], [132, 'u', 'ShiftLeft'], [133, 'd', 'KeyJ'], [134, 'u', 'KeyJ'], [150, 'u', 'KeyD'],
    [200, 'd', 'Space'], [214, 'u', 'Space'], [222, 'd', 'KeyJ'], [223, 'u', 'KeyJ']] },
  parryBot: { frames: 200, x: 420, bot: 520, botMode: 'parry', steps: [[0, 'd', 'KeyJ'], [1, 'u', 'KeyJ'], [110, 'd', 'KeyD'], [111, 'd', 'KeyJ'], [112, 'u', 'KeyJ'], [125, 'u', 'KeyD']] },
  playerParry: { frames: 90, x: 420, bot: 1100, steps: [[10, 'd', 'ShiftLeft'], [12, 'u', 'ShiftLeft'], [60, 'd', 'KeyJ'], [61, 'u', 'KeyJ']] },
  kill: { frames: 360, x: 420, bot: 520, botDmg: 140, steps: [[0, 'd', 'KeyD'], [1, 'd', 'KeyJ'], [2, 'u', 'KeyJ'], [30, 'u', 'KeyD']] },
};
const SEEDED = `(() => { let s = 12345; Math.random = () => { s |= 0; s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; })();`;
(async () => {
  const b = await chromium.launch(); const out = {}, errs = [];
  for (const [k, S] of Object.entries(SC)) {
    const p = await b.newPage(); p.on('pageerror', e => errs.push(k + ': ' + e.message)); await p.addInitScript(SEEDED);
    await p.goto('file://' + file); await p.waitForTimeout(150);
    out[k] = await p.evaluate((S) => {
      const L = __cards.LOADOUT; __startPractice(); L.bot.companion = null; L.pl.passives = []; L.pl.companion = null;
      L.pl.weapon = S.sword ? 'sword' : null; L.pl.weaponSpec = S.sword ? { id: 'sword', rarity: 'common', base: 10, mods: [] } : null; __resetRound();
      const key = (c, d) => window.dispatchEvent(new KeyboardEvent(d ? 'keydown' : 'keyup', { code: c }));
      for (let i = 0; i < 30; i++) __tick(1 / 60);
      Object.assign(__fighter, { x: S.x ?? 500, vx: 0, facing: 1 }); Object.assign(__bot, { x: S.bot, damage: S.botDmg || 0 }); __bot.mode = S.botMode || 'dummy';
      for (let i = 0; i < 20; i++) { Object.assign(__bot, { x: S.bot }); __tick(1 / 60); }
      const r6 = (v) => typeof v === 'number' ? Math.round(v * 1e4) / 1e4 : v, rows = [];
      for (let f = 0; f < S.frames; f++) {
        for (const [fr, ud, c] of S.steps) if (fr === f) key(c, ud === 'd');
        __tick(1 / 60);
        const P = __fighter, B = __bot;
        rows.push({ px: r6(P.x), py: r6(P.y), pvx: r6(P.vx), pvy: r6(P.vy), pg: P.onGround, pf: P.facing, pd: r6(P.damage), atk: P.punch.on ? P.punch.A.name : '', at: r6(P.punch.t || 0),
          dash: r6(P.dashT), parry: r6(P.parryT), stag: r6(P.staggerT), prag: !!P.rag, ptl: r6(P.pose.tl), pfa1: r6(P.pose.fa1), pfl1: r6(P.pose.fl1),
          bx: r6(B.x), by: r6(B.y), bvx: r6(B.vx), bvy: r6(B.vy), bd: r6(B.damage), brag: !!B.rag, bstun: r6(B.stunT), bparry: r6(B.parryT), bdead: B.dead > 0, bfa1: r6(B.pose.fa1) });
      }
      return rows;
    }, S);
    await p.close();
  }
  await b.close();
  if (errs.length) console.log('page errors:', errs);
  const gf = path.join(__dirname, 'golden', name + '.json');
  if (mode === 'record') { fs.writeFileSync(gf, JSON.stringify(out)); console.log('recorded', Object.keys(out).map(k => k + ':' + out[k].length).join(' '), '->', gf); return; }
  const before = JSON.parse(fs.readFileSync(path.join(__dirname, 'golden', name + '.json'), 'utf8'));
  for (const k of Object.keys(SC)) {
    const A = before[k], B = out[k], worst = {}; let firstDiff = null;
    for (let i = 0; i < Math.min(A.length, B.length); i++) for (const f of Object.keys(A[i])) {
      const a = A[i][f], c = B[i][f], d = typeof a === 'number' ? Math.abs(a - c) : (a === c ? 0 : 1);
      if (d > (worst[f]?.d || 0)) worst[f] = { d: +d.toFixed(4), frame: i };
      if (d > 1e-3 && firstDiff === null) firstDiff = { frame: i, field: f, before: a, after: c };
    }
    const bad = Object.entries(worst).filter(([, w]) => w.d > 1e-3).map(([f, w]) => `${f}:${w.d}@${w.frame}`);
    console.log(k.padEnd(12), bad.length ? 'DIFF ' + bad.join(' ') + '  first: ' + JSON.stringify(firstDiff) : 'identical');
  }
})();

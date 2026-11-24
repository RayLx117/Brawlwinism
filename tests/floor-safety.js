// Nobody ends up inside the solid floor: the plunge stab from many heights and positions (pinned and kicked off, or let go at
// different moments), plus random fights; flags anyone whose feet (or, ragdolled, their middle) are well below the walk line while
// over the stage for more than 10 frames in a row (being eased out sideways through an open edge takes a few). Exit 1 on a problem.
const { chromium } = require('playwright'); const path = require('path'); const T = require('./sync-test-packs.js');
(async () => { const b = await chromium.launch(); const p = await b.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
await p.goto('file://' + path.resolve(__dirname, '../index.html')); await p.waitForTimeout(200);
const r = await p.evaluate(() => {
  const L = __cards.LOADOUT, K = (c, d) => window.dispatchEvent(new KeyboardEvent(d ? 'keydown' : 'keyup', { code: c })), PY = 540, X0 = 150, bad = [];
  const inside = (f) => { if (f.dead > 0 || f.out || f.impaledBy) return false; const [x, y] = f.rag && f.R ? f.R.centre : [f.x, f.y]; return x > X0 + 2 && x < 1180 && y > PY + (f.rag ? 30 : 12); };
  const run = {}; const check = (tag, i) => { for (const [k, f] of [['pl', __fighter], ['bot', __bot]]) { run[k] = inside(f) ? (run[k] || 0) + 1 : 0; if (run[k] > 10) { bad.push({ tag, i, who: k, x: Math.round(f.x), y: Math.round(f.y), rag: !!f.rag }); return true; } } return false; };
  const setup = () => { __startPractice(); L.bot.companion = null; L.pl.passives = []; L.pl.weapon = 'sword'; L.pl.weaponSpec = { id: 'sword', rarity: 'rare', base: 18, mods: [] }; __resetRound(); __step(1 / 60, 5); };
  let runs = 0;
  for (const px of [170, 300, 640, 1050]) for (const h of [120, 200, 300, 400]) for (const letGo of [0, 6, 12, 18]) for (const off of [6, 14, -4]) {
    setup(); runs++; run.pl = run.bot = 0;
    Object.assign(__fighter, { x: px, y: PY - h, vx: 0, vy: 0, onGround: false, facing: 1 }); Object.assign(__bot, { x: px + off, y: PY - h + 120, vx: 0, vy: 0, onGround: false });
    K('KeyS', 1); K('KeyJ', 1);
    for (let i = 0; i < 200; i++) { if (letGo && i === letGo) { K('KeyS', 0); K('KeyJ', 0); } __tick(1 / 60); if (check(`plunge x${px} h${h} letGo${letGo} off${off}`, i)) break; }
    K('KeyS', 0); K('KeyJ', 0);
  }
  return { runs, bad: bad.slice(0, 8), count: bad.length };
});
console.log(JSON.stringify(r));
let fights = 0;
for (const seed of [5, 9, 31]) { const n = await p.evaluate(([P]) => { const L = __cards.LOADOUT; __startPractice(); for (const s of ['pl', 'bot']) Object.assign(L[s], { weapon: 'sword', weaponSpec: { id: 'sword', rarity: 'rare', base: 18, mods: [] }, companion: null, passives: [] }); __resetRound();
  Object.assign(__fighter, { x: 560 }); Object.assign(__bot, { x: 680 }); let n = 0; const R = [0, 0]; for (const pk of P) { __simFrame(pk); for (const f of [__fighter, __bot]) { if (f.dead > 0 || f.out || f.impaledBy) continue; const [x, y] = f.rag && f.R ? f.R.centre : [f.x, f.y]; const k = f === __fighter ? 0 : 1; R[k] = x > 152 && x < 1180 && y > 540 + (f.rag ? 30 : 12) ? R[k] + 1 : 0; if (R[k] > 10) n++; } } return n; }, [T.packs(seed, 2000)]); fights += n; }
console.log('random fights, frames inside the floor:', fights);
console.log('errors', errs); await b.close(); process.exit(r.count || fights || errs.length ? 1 : 0); })();

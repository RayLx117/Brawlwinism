// Teleport scan: random inputs for both players (the sync test's packets, more downward air dashes and plunges), several setups;
// flags any frame where a fighter's position jumps more than 80 px without a respawn. Also: a knockout while impaling must free
// the target (no pin after the respawn). Exit 1 on any problem.
const { chromium } = require('playwright'); const path = require('path'); const T = require('./sync-test-packs.js');
(async () => { const b = await chromium.launch(); const p = await b.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
await p.goto('file://' + path.resolve(__dirname, '../index.html')); await p.waitForTimeout(200);
let bad = 0;
for (const [name, sword] of [['fists', false], ['sword', true]]) for (const seed of [11, 23, 37]) {
  const r = await p.evaluate(([P, sword]) => {
    __startPractice(); const L = __cards.LOADOUT;
    for (const s of ['pl', 'bot']) Object.assign(L[s], { weapon: sword ? 'sword' : null, weaponSpec: sword ? { id: 'sword', rarity: 'rare', base: 18, mods: [] } : null, companion: null, passives: [] });
    __resetRound(); Object.assign(__fighter, { x: 560 }); Object.assign(__bot, { x: 680 });
    const jumps = []; let prev = [[__fighter.x, __fighter.y], [__bot.x, __bot.y]], alive = [true, true];
    P.forEach((pk, i) => { __simFrame(pk); [__fighter, __bot].forEach((f, k) => { const live = !(f.dead > 0) && !f.out, d = Math.hypot(f.x - prev[k][0], f.y - prev[k][1]);
      if (live && alive[k] && d > 80) jumps.push({ frame: i, who: k ? 'bot' : 'pl', from: prev[k].map(Math.round), to: [Math.round(f.x), Math.round(f.y)], pinned: !!f.impaledBy, rag: !!f.rag }); prev[k] = [f.x, f.y]; alive[k] = live; }); });
    return jumps.slice(0, 4);
  }, [T.packs(seed, 1800), sword]);
  if (r.length) bad++;
  console.log((r.length ? 'JUMPS ' : 'ok    ') + name + ' seed ' + seed, r.length ? JSON.stringify(r) : '');
}
// knocked out mid-plunge with the bot on the blade: the bot must be let go
const ko = await p.evaluate(() => { const L = __cards.LOADOUT; __startPractice(); L.bot.companion = null; L.pl.weapon = 'sword'; L.pl.weaponSpec = { id: 'sword', rarity: 'rare', base: 18, mods: [] }; __resetRound(); __step(1 / 60, 10);
  Object.assign(__fighter, { x: 120, y: 200, vx: 0, vy: 0, onGround: false, facing: 1 }); Object.assign(__bot, { x: 132, y: 330, vx: 0, vy: 0, onGround: false });
  const K = (c, d) => window.dispatchEvent(new KeyboardEvent(d ? 'keydown' : 'keyup', { code: c })); K('KeyS', 1); K('KeyJ', 1);
  let impaled = false, after = null; for (let i = 0; i < 240; i++) { __step(1 / 60, 1); if (__fighter.impaleOn) impaled = true; } K('KeyS', 0); K('KeyJ', 0);
  return { impaled, plImpaleOn: __fighter.impaleOn || __fighter.stuckOn || null, botPinnedBy: __bot.impaledBy || null }; });
console.log('KO while impaling:', JSON.stringify(ko)); if (ko.plImpaleOn || ko.botPinnedBy) bad++;
// targeted: (1) air dash down-forward into the floor mid-stage; (2) let go of the plunge just above the floor with the bot on it;
// (3) plant the blade at the very edge so you fall off while it's stuck: after the respawn nobody is pinned
const t = await p.evaluate(() => { const L = __cards.LOADOUT, K = (c, d) => window.dispatchEvent(new KeyboardEvent(d ? 'keydown' : 'keyup', { code: c })), out = {};
  const setup = (sword) => { __startPractice(); L.bot.companion = null; L.pl.weapon = sword ? 'sword' : null; L.pl.weaponSpec = sword ? { id: 'sword', rarity: 'rare', base: 18, mods: [] } : null; __resetRound(); __step(1 / 60, 10); };
  const watch = (n, hook) => { const fs = [__fighter, __bot], prev = fs.map(f => [f.x, f.y]); let worst = { d: 0 }; for (let i = 0; i < n; i++) { hook && hook(i); __step(1 / 60, 1); fs.forEach((f, k) => { const d = Math.hypot(f.x - prev[k][0], f.y - prev[k][1]); if (!(f.dead > 0) && d > worst.d) worst = { d: Math.round(d), who: k ? 'bot' : 'pl', frame: i, x: Math.round(f.x) }; prev[k] = [f.x, f.y]; }); } return worst; };
  setup(false); out.airDashDown = [];
  for (const x of [400, 600, 800]) { Object.assign(__fighter, { x, y: 420, vx: 0, vy: 0, onGround: false, facing: 1 }); out.airDashDown.push(watch(40, (i) => { if (i === 0) { K('KeyD', 1); K('KeyS', 1); K('ShiftLeft', 1); } if (i === 2) K('ShiftLeft', 0); if (i === 20) { K('KeyD', 0); K('KeyS', 0); } })); __step(1 / 60, 60); }
  setup(true); Object.assign(__fighter, { x: 600, y: 330, vx: 0, vy: 0, onGround: false, facing: 1 }); Object.assign(__bot, { x: 612, y: 440, vx: 0, vy: 0, onGround: false });
  out.letGoLow = watch(80, (i) => { if (i === 0) { K('KeyS', 1); K('KeyJ', 1); } if (i === 5) { K('KeyS', 0); K('KeyJ', 0); } });
  setup(true); Object.assign(__fighter, { x: 128, y: 300, vx: 0, vy: 0, onGround: false, facing: 1 }); Object.assign(__bot, { x: 160, y: 440, vx: 0, vy: 0, onGround: false });
  K('KeyS', 1); K('KeyJ', 1); let stuck = false; for (let i = 0; i < 300; i++) { __step(1 / 60, 1); if (__fighter.stuckT > 0) stuck = true; } K('KeyS', 0); K('KeyJ', 0);
  out.edgePlant = { gotStuck: stuck, stillStuck: __fighter.stuckT > 0, pinning: __fighter.stuckOn || __fighter.impaleOn || null, botPinned: __bot.impaledBy || null, botX: Math.round(__bot.x) };
  return out; });
console.log('targeted', JSON.stringify(t));
if (t.airDashDown.some(w => w.d > 80) || t.letGoLow.d > 80 || t.edgePlant.pinning || t.edgePlant.botPinned) bad++;
console.log('errors', errs); await b.close(); process.exit(bad || errs.length ? 1 : 0); })();

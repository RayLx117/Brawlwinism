// The Divine General's adapting kit: armour (no more than 20% per hit), regen (20% every 7 s of real time, whatever his speed), and
// the speed-up (+10% per full 100% damage, back down when he heals below a step). Also frames of the regen (wheel snapping back,
// green shimmer down him): out/dg-regen.png
const { chromium } = require('playwright'); const path = require('path'), fs = require('fs'), { execSync } = require('child_process');
const OUT = path.join(__dirname, 'out') + '/'; fs.mkdirSync(OUT, { recursive: true });
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1.5 }); const errs = []; p.on('pageerror', e => errs.push(e.message));
await p.goto('file://' + path.resolve(__dirname, '../index.html')); await p.waitForTimeout(300);
const r = await p.evaluate(() => {
  __startPractice(); const L = __cards.LOADOUT; L.pl.companion = null; L.bot.companion = 'divineGeneral'; L.pl.weapon = 'sword'; L.pl.weaponSpec = __weapons.rollWeapon('sword', 'ancient'); L.pl.weaponSpec.mods = []; __resetRound();
  for (let i = 0; i < 60 * 4 && !(__dg() && __dg().state === 'idle'); i++) __tick(1 / 60);
  const g = __dg(), out = { state: g.state };
  // speed: how much of his clock runs per real second at each damage
  out.speed = {}; for (const d of [0, 99, 100, 250, 499, 500]) { g.damage = d; g.regenT = -99; const t0 = g.time; for (let i = 0; i < 60; i++) { g.state = 'idle'; g.gapT = 9; __tick(1 / 60); } out.speed[d] = +(g.time - t0).toFixed(3); }
  // regen: damage 140, watch it fall to 120 at the 7 s mark of real time (speed-up from his damage doesn't change that)
  g.damage = 140; g.regenT = 0; let at = null; for (let i = 0; i < 60 * 8; i++) { g.state = 'idle'; g.gapT = 9; __tick(1 / 60); if (at === null && g.damage < 140) at = +(i / 60).toFixed(2); }
  out.regen = { at, dmg: g.damage };
  // armour: a 65% ancient sword jab on him takes no more than 20%
  g.damage = 0; g.regenT = -99; Object.assign(g, { x: 700, facing: -1 }); Object.assign(__fighter, { x: 560, facing: 1, vx: 0 }); __fighter.punch.next = 0; __fighter.punch.lastEnd = -9;
  window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyJ' })); window.dispatchEvent(new KeyboardEvent('keyup', { code: 'KeyJ' }));
  let took = 0; for (let i = 0; i < 40; i++) { g.state = 'idle'; g.gapT = 9; Object.assign(g, { x: 700 }); __tick(1 / 60); took = Math.max(took, g.damage); }
  out.armour = { wpn: __fighter.wpn && __fighter.wpn.dmg, took };
  return out; });
console.log(JSON.stringify(r));
// the regen animation, frame by frame
const box = await p.locator('canvas').boundingBox(), k = box.width / 1280, fs_ = [];
await p.evaluate(() => { const g = __dg(); g.damage = 260; g.regenT = 6.99; g.x = 700; g.state = 'idle'; g.gapT = 9; __step(1 / 60, 1); });
for (let i = 0; i < 8; i++) { await p.evaluate(() => { const g = __dg(); g.state = 'idle'; g.gapT = 9; __step(1 / 60, 2); }); const f = OUT + `dgr-${i}.png`; await p.screenshot({ path: f, clip: { x: box.x + 520 * k, y: box.y + 60 * k, width: 360 * k, height: 500 * k } }); fs_.push(f); }
execSync(`python3 ${__dirname}/grid.py ${OUT}dg-regen.png 8 0.5 ${fs_.join(' ')}`);
console.log(JSON.stringify(await p.evaluate(() => ({ afterRegen: __dg().damage }))));
console.log('errors', errs); await b.close(); })();

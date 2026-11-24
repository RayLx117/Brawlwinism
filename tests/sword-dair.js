// Sword down air (plunge stab): (1) impale a bot in the air: carried down on its back, pinned, kicked off when the sword comes out;
// (2) stab empty floor: stuck the same 1.5 s; (3) let go of down mid-air: ends early, nothing stuck.
// Frame sheets (every 3rd frame): out/sword-dair-impale.png, out/sword-dair-whiff.png
const { chromium } = require('playwright'); const path = require('path'), fs = require('fs'), { execSync } = require('child_process');
const OUT = path.join(__dirname, 'out') + '/';
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 2.5 }); const errs = []; p.on('pageerror', e => errs.push(e.message));
await p.goto('file://' + path.resolve(__dirname, '../index.html')); await p.waitForTimeout(300);
await p.evaluate(() => { window.SETUP = (px, py, bx, by) => { const L = __cards.LOADOUT; __startPractice(); L.bot.companion = null; L.pl.passives = []; L.pl.weapon = 'sword'; L.pl.weaponSpec = { id: 'sword', rarity: 'mythic', base: 30, mods: [] }; __resetRound(); __step(1 / 60, 20);
    Object.assign(__fighter, { x: px, y: py, vx: 0, vy: 0, onGround: false, facing: 1 }); Object.assign(__bot, { x: bx, y: by, vx: 0, vy: 0, damage: 20, onGround: by >= 540 }); };
  window.K = (c, d) => window.dispatchEvent(new KeyboardEvent(d ? 'keydown' : 'keyup', { code: c })); });
const r = await p.evaluate(() => { const out = {}, run = (n, hold) => { const log = []; K('KeyS', 1); K('KeyJ', 1); for (let i = 0; i < n; i++) { if (hold && i === hold) { K('KeyS', 0); K('KeyJ', 0); } __step(1 / 60, 1);
      log.push({ i, bd: __bot.damage, imp: __fighter.impaleOn || __fighter.stuckOn, stuck: +(__fighter.stuckT || 0).toFixed(2), rag: !!__bot.rag, rot: +(__bot.rot || 0).toFixed(2), bvx: Math.round(__bot.vx), mv: __fighter.punch.on ? 1 : 0 }); } K('KeyS', 0); K('KeyJ', 0); return log; };
  SETUP(500, 200, 512, 330); let L = run(150); const imp = L.find(s => s.imp), kick = L.find(s => s.rag);
  out.impale = { impaledAt: imp && imp.i, onItsBack: imp && L[imp.i + 2].rot, dmgImpale: imp && imp.bd - 20, kickedAt: kick && kick.i, kickVx: kick && kick.bvx, total: L[L.length - 1].bd - 20, stuckFrames: L.filter(s => s.stuck > 0).length };
  SETUP(500, 300, 1000, 540); L = run(130); out.whiff = { stuckFrames: L.filter(s => s.stuck > 0).length, dmg: L[L.length - 1].bd - 20 };
  SETUP(500, 150, 1000, 540); L = run(40, 14); out.letGo = { moveFrames: L.filter(s => s.mv).length, stuckFrames: L.filter(s => s.stuck > 0).length };
  return out; });
console.log(JSON.stringify(r, null, 1));
const box = await p.locator('canvas').boundingBox(), k = box.width / 1280;
for (const [name, bx, by] of [['impale', 512, 330], ['whiff', 1000, 540]]) {
  const fs_ = [];
  await p.evaluate(([bx, by]) => { SETUP(500, 200, bx, by); K('KeyS', 1); K('KeyJ', 1); }, [bx, by]);
  for (let i = 0; i < 40; i++) { const x = await p.evaluate(() => { __step(1 / 60, 3); return __fighter.x; }); const f = OUT + `sdr-${name}-${i}.png`; await p.screenshot({ path: f, clip: { x: box.x + (x - 110) * k, y: box.y + 330 * k, width: 250 * k, height: 230 * k } }); fs_.push(f); }
  await p.evaluate(() => { K('KeyS', 0); K('KeyJ', 0); });
  execSync(`python3 ${__dirname}/grid.py ${OUT}sword-dair-${name}.png 10 0.4 ${fs_.join(' ')}`);
}
console.log('errors', errs); await b.close(); })();

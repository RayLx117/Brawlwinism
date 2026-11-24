// Sword down air (plunge stab): (1) impale a bot in the air, ride it down, ground shock pops it off; (2) land next to a standing
// bot: the shock pops it; (3) stab empty floor: stuck 0.7 s; (4) let go of down mid-air: ends early. Frames of (1) and (3):
// out/sword-dair.png
const { chromium } = require('playwright'); const path = require('path'), fs = require('fs'), { execSync } = require('child_process');
const OUT = path.join(__dirname, 'out') + '/';
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 2 }); const errs = []; p.on('pageerror', e => errs.push(e.message));
await p.goto('file://' + path.resolve(__dirname, '../index.html')); await p.waitForTimeout(300);
await p.evaluate(() => { window.SETUP = (px, py, bx, by, mode) => { const L = __cards.LOADOUT; __startPractice(); L.bot.companion = null; L.pl.passives = []; L.pl.weapon = 'sword'; L.pl.weaponSpec = { id: 'sword', rarity: 'mythic', base: 30, mods: [] }; __resetRound(); __step(1 / 60, 20);
    Object.assign(__fighter, { x: px, y: py, vx: 0, vy: 0, onGround: false, facing: 1 }); Object.assign(__bot, { x: bx, y: by, vx: 0, vy: 0, damage: 20, onGround: by >= 540 }); __bot.mode = mode || 'dummy'; };
  window.K = (c, d) => window.dispatchEvent(new KeyboardEvent(d ? 'keydown' : 'keyup', { code: c })); });
const r = await p.evaluate(() => { const out = {}, run = (n, hold, hook) => { const log = []; K('KeyS', 1); K('KeyJ', 1); for (let i = 0; i < n; i++) { if (hold && i === hold) { K('KeyS', 0); K('KeyJ', 0); } if (hook) hook(i); __step(1 / 60, 1); log.push({ i, by: Math.round(__bot.y), bd: __bot.damage, imp: __fighter.impaleOn, stuck: +(__fighter.stuckT || 0).toFixed(2), mv: __fighter.punch.on ? __fighter.punch.A.name : '-', bvy: Math.round(__bot.vy) }); } K('KeyS', 0); K('KeyJ', 0); return log; };
  SETUP(500, 200, 512, 330); let L = run(70); const imp = L.find(s => s.imp), land = L.find((s, i) => i && L[i - 1].imp && !s.imp);
  out.impale = { impaledAt: imp && imp.i, dmgOnImpale: imp && imp.bd - 20, releasedAt: land && land.i, totalDmg: L[L.length - 1].bd - 20, popVy: land && land.bvy, stuck: Math.max(...L.map(s => s.stuck)) };
  SETUP(500, 300, 560, 540); __step(1 / 60, 1); Object.assign(__bot, { x: 560, y: 540, vy: 0, onGround: true }); L = run(70); out.shockStanding = { totalDmg: L[L.length - 1].bd - 20, minBotY: Math.min(...L.map(s => s.by)), stuck: Math.max(...L.map(s => s.stuck)), trace: L.slice(5, 16).map(s => s.by + '/' + s.bd + '/' + (s.imp || '') + '/' + s.bvy).join(' ') };
  SETUP(500, 300, 430, 540); __step(1 / 60, 1); Object.assign(__bot, { x: 430, y: 540, vy: 0, onGround: true }); L = run(70); out.shockOnly = { impaled: L.some(s => s.imp), totalDmg: L[L.length - 1].bd - 20, minBotY: Math.min(...L.map(s => s.by)) };
  SETUP(500, 300, 1000, 540); L = run(80); out.whiff = { stuck: Math.max(...L.map(s => s.stuck)), stuckFrames: L.filter(s => s.stuck > 0).length };
  SETUP(500, 150, 1000, 540); L = run(40, 14); out.letGo = { moveFrames: L.filter(s => s.mv !== '-').length, stuck: Math.max(...L.map(s => s.stuck)) };
  return out; });
console.log(JSON.stringify(r, null, 1));
const box = await p.locator('canvas').boundingBox(), k = box.width / 1280, fs_ = [];
for (const [bx, by] of [[512, 330], [1000, 540]]) {
  await p.evaluate(([bx, by]) => { SETUP(500, 200, bx, by); K('KeyS', 1); K('KeyJ', 1); }, [bx, by]);
  for (let i = 0; i < 12; i++) { await p.evaluate(() => __step(1 / 60, 3)); const f = OUT + `sdr-${fs_.length}.png`; await p.screenshot({ path: f, clip: { x: box.x + 380 * k, y: box.y + 140 * k, width: 280 * k, height: 420 * k } }); fs_.push(f); }
  await p.evaluate(() => { K('KeyS', 0); K('KeyJ', 0); });
}
execSync(`python3 ${__dirname}/grid.py ${OUT}sword-dair.png 12 0.4 ${fs_.join(' ')}`);
console.log('errors', errs); await b.close(); })();

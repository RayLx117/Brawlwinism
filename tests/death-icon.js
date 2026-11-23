// The death icon: the bot knocked off screen for real (its portrait gets the red skull, ink thrown off), then the player's.
// Frames through the slam, hold and fade (real time, since the HUD animates on the clock). Sheet: out/death-icon.png
const { chromium } = require('playwright'); const path = require('path'), fs = require('fs'), { execSync } = require('child_process');
const OUT = path.join(__dirname, 'out') + '/'; fs.mkdirSync(OUT, { recursive: true });
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 2 }); const errs = []; p.on('pageerror', e => errs.push(e.message));
await p.goto('file://' + path.resolve(__dirname, '../index.html')); await p.waitForTimeout(300);
await p.evaluate(() => { __startPractice(); const L = __cards.LOADOUT; L.bot.companion = null; __resetRound(); });
await p.waitForTimeout(300);
const box = await p.locator('canvas').boundingBox(), k = box.width / 1280, fs_ = [];
// knock the bot out for real: throw it off the side
await p.evaluate(() => { Object.assign(__bot, { damage: 150, x: 1000 }); Object.assign(__fighter, { x: 960, facing: 1 }); __fighter.punch.next = 2; __fighter.punch.lastEnd = __fighter.time; });
await p.keyboard.down('KeyD'); await p.keyboard.press('KeyJ'); await p.waitForTimeout(150); await p.keyboard.up('KeyD');
for (let i = 0; i < 100 && !(await p.evaluate(() => __bot.dead > 0)); i++) await p.waitForTimeout(16);
const t0 = Date.now();
for (const ms of [30, 90, 150, 220, 400, 900, 1300, 1500]) { const w = ms - (Date.now() - t0); if (w > 0) await p.waitForTimeout(w);
  const f = OUT + `dth-${fs_.length}.png`; await p.screenshot({ path: f, clip: { x: box.x + 460 * k, y: box.y + 540 * k, width: 360 * k, height: 180 * k } }); fs_.push(f); }
console.log(JSON.stringify(await p.evaluate(() => ({ botDead: __bot.dead > 0, botX: Math.round(__bot.x), dmg: __bot.damage }))));
await p.evaluate(() => __hudDeath('pl')); await p.waitForTimeout(500);
await p.screenshot({ path: OUT + 'death-icon-zoom.png', clip: { x: box.x + 450 * k, y: box.y + 560 * k, width: 180 * k, height: 160 * k } });
execSync(`python3 ${__dirname}/grid.py ${OUT}death-icon.png 4 0.6 ${fs_.join(' ')}`);
console.log('errors', errs); await b.close(); })();

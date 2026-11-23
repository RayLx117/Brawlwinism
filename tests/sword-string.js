// The full sword string on the bot: rising slash (knocked straight up), then the overhead pressed straight away, catching them
// on the way down. Frames every 3rd frame, hitbox view on: out/sword-string.png
const { chromium } = require('playwright'); const path = require('path'), fs = require('fs'), { execSync } = require('child_process');
const OUT = path.join(__dirname, 'out') + '/'; fs.mkdirSync(OUT, { recursive: true });
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 2 }); const errs = []; p.on('pageerror', e => errs.push(e.message));
await p.goto('file://' + path.resolve(__dirname, '../index.html')); await p.waitForTimeout(300);
await p.evaluate(() => { __startPractice(); const L = __cards.LOADOUT; L.bot.companion = null; L.pl.weapon = 'sword'; L.pl.weaponSpec = Object.assign(__weapons.rollWeapon('sword', 'common'), { mods: [] }); __resetRound(); __step(1 / 60, 30);
  Object.assign(__fighter, { x: 420, facing: 1 }); Object.assign(__bot, { x: 540, damage: 30 }); __step(1 / 60, 30); __bot.x = 540;
  window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyH' })); window.dispatchEvent(new KeyboardEvent('keyup', { code: 'KeyH' }));
  window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyJ' })); window.dispatchEvent(new KeyboardEvent('keyup', { code: 'KeyJ' })); });
const box = await p.locator('canvas').boundingBox(), k = box.width / 1280, fs_ = [], log = [];
for (let i = 0; i < 24; i++) {
  const st = await p.evaluate((i) => { if (i === 2) { window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyJ' })); window.dispatchEvent(new KeyboardEvent('keyup', { code: 'KeyJ' })); } __step(1 / 60, 3); return { mv: __fighter.punch.on ? __fighter.punch.A.name : '-', dmg: __bot.damage, rag: !!__bot.rag, by: Math.round(__bot.y) }; }, i);
  log.push(st); const f = OUT + `sst-${i}.png`; await p.screenshot({ path: f, clip: { x: box.x + 330 * k, y: box.y + 240 * k, width: 380 * k, height: 320 * k } }); fs_.push(f); }
console.log(JSON.stringify(log.filter((s, i) => i % 2 === 0)));
execSync(`python3 ${__dirname}/grid.py ${OUT}sword-string.png 8 0.42 ${fs_.join(' ')}`);
console.log('errors', errs); await b.close(); })();

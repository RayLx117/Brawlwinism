// Close-up frame sheets of the sword string's two slashes on their own (no target): every frame through the wind-up and swing.
// Sheets: out/sword-rise-zoom.png, out/sword-over-zoom.png
const { chromium } = require('playwright'); const path = require('path'), fs = require('fs'), { execSync } = require('child_process');
const OUT = path.join(__dirname, 'out') + '/'; fs.mkdirSync(OUT, { recursive: true });
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 3 }); const errs = []; p.on('pageerror', e => errs.push(e.message));
await p.goto('file://' + path.resolve(__dirname, '../index.html')); await p.waitForTimeout(300);
await p.evaluate(() => { __startPractice(); const L = __cards.LOADOUT; L.bot.companion = null; L.pl.weapon = 'sword'; L.pl.weaponSpec = __weapons.rollWeapon('sword', 'common'); L.pl.weaponSpec.mods = []; __resetRound(); __step(1 / 60, 30);
  Object.assign(__fighter, { x: 500, facing: 1 }); Object.assign(__bot, { x: 1100 }); __step(1 / 60, 40); });
const box = await p.locator('canvas').boundingBox(), k = box.width / 1280;
const sheet = async (name, frames, every) => { const fs_ = [];
  await p.evaluate(() => { window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyJ' })); window.dispatchEvent(new KeyboardEvent('keyup', { code: 'KeyJ' })); });
  for (let i = 0; i < frames; i++) { const x = await p.evaluate((e) => { __step(1 / 60, e); return __fighter.x; }, every); const f = OUT + `${name}-${i}.png`; await p.screenshot({ path: f, clip: { x: box.x + (x - 105) * k, y: box.y + 350 * k, width: 230 * k, height: 210 * k } }); fs_.push(f); }
  execSync(`python3 ${__dirname}/grid.py ${OUT}${name}.png 8 0.5 ${fs_.join(' ')}`); };
await sheet('sword-rise-zoom', 16, 1);
await p.evaluate(() => { __fighter.punch.next = 1; __fighter.punch.lastEnd = __fighter.time; });
await sheet('sword-over-zoom', 24, 2);
console.log('errors', errs); await b.close(); })();

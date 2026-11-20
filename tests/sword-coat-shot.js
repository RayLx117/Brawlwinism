// The sword's ink coat and shed: a close-up standing, and frames through a jab and an uppercut. Sheet: out/sword-coat.png.
const { chromium } = require('playwright'); const path = require('path'), fs = require('fs'), { execSync } = require('child_process');
const OUT = path.join(__dirname, 'out') + '/'; fs.mkdirSync(OUT, { recursive: true });
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 3 }); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('file://' + path.resolve(__dirname, '../index.html')); await p.waitForTimeout(400);
  await p.evaluate(() => { __startPractice(); const L = __cards.LOADOUT; L.bot.companion = null; L.pl.weapon = 'sword'; L.pl.weaponSpec = { id: 'sword', rarity: 'rare', base: 18, mods: [] }; __resetRound(); __bot.x = 1150; Object.assign(__fighter, { x: 480 }); __step(1 / 60, 60); });
  const box = await p.locator('canvas').boundingBox(), k = box.width / 1280, fs_ = [];
  const shot = async (n) => { const f = OUT + `coat-${fs_.length}.png`; await p.screenshot({ path: f, clip: { x: box.x + 400 * k, y: box.y + 360 * k, width: 230 * k, height: 200 * k } }); fs_.push(f); };
  await shot();
  for (const steps of [6, 2, 2, 3, 6]) { await p.evaluate((n) => { if (!window.__j) { window.__j = 1; window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyJ' })); window.dispatchEvent(new KeyboardEvent('keyup', { code: 'KeyJ' })); } __step(1 / 60, n); }, steps); await shot(); }
  await p.evaluate(() => { __fighter.punch.on = false; __step(1 / 60, 30); for (const c of ['KeyJ']) {} });
  execSync(`python3 ${__dirname}/grid.py ${OUT}sword-coat.png 3 0.6 ${fs_.join(' ')}`);
  console.log('errors', errs); await b.close();
})();

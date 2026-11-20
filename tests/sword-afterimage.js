// The sword's swing afterimages: consecutive frames through a jab > cross > uppercut string, one frame apart. Sheet: out/sword-afterimage.png.
const { chromium } = require('playwright'); const path = require('path'), fs = require('fs'), { execSync } = require('child_process');
const OUT = path.join(__dirname, 'out') + '/'; fs.mkdirSync(OUT, { recursive: true });
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 2 }); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('file://' + path.resolve(__dirname, '../index.html')); await p.waitForTimeout(400);
  await p.evaluate(() => { __startPractice(); const L = __cards.LOADOUT; L.bot.companion = null; L.pl.weapon = 'sword'; L.pl.weaponSpec = { id: 'sword', rarity: 'rare', base: 18, mods: [] }; __resetRound(); __bot.x = 1150; Object.assign(__fighter, { x: 480 }); __step(1 / 60, 60); });
  const box = await p.locator('canvas').boundingBox(), k = box.width / 1280, fs_ = [];
  const press = () => p.evaluate(() => { window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyJ' })); window.dispatchEvent(new KeyboardEvent('keyup', { code: 'KeyJ' })); });
  await press();
  for (let i = 0; i < 40; i++) {
    if (i === 10 || i === 22) await press();
    await p.evaluate(() => __step(1 / 60, 1));
    if (i % 2 === 0 || (i > 4 && i < 14) || i > 26) { const x = await p.evaluate(() => [__fighter.x, __fighter.y]); const f = OUT + `ghost-${i}.png`; await p.screenshot({ path: f, clip: { x: box.x + (x[0] - 110) * k, y: box.y + (x[1] - 200) * k, width: 260 * k, height: 220 * k } }); fs_.push(f); }
  }
  execSync(`python3 ${__dirname}/grid.py ${OUT}sword-afterimage.png 8 0.4 ${fs_.slice(0, 24).join(' ')}`);
  console.log('frames', fs_.length, 'errors', errs); await b.close();
})();

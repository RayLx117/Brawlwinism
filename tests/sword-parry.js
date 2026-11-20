// The sword parry: frames through a parry facing right, then one facing left, close up. Sheet: out/sword-parry.png.
const { chromium } = require('playwright'); const path = require('path'), fs = require('fs'), { execSync } = require('child_process');
const OUT = path.join(__dirname, 'out') + '/'; fs.mkdirSync(OUT, { recursive: true });
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 2 }); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('file://' + path.resolve(__dirname, '../index.html')); await p.waitForTimeout(400);
  await p.evaluate(() => { __startPractice(); const L = __cards.LOADOUT; L.bot.companion = null; L.pl.weapon = 'sword'; L.pl.weaponSpec = { id: 'sword', rarity: 'rare', base: 18, mods: [] }; __resetRound(); __bot.x = 1150; __step(1 / 60, 30); });
  const box = await p.locator('canvas').boundingBox(), k = box.width / 1280, fs_ = [];
  for (const face of [1, -1]) {
    await p.evaluate((face) => { Object.assign(__fighter, { x: 500, y: 540, facing: face, parryCd: 0, parryT: 0, lockT: 0 }); __step(1 / 60, 30); window.dispatchEvent(new KeyboardEvent('keydown', { code: 'ShiftLeft' })); window.dispatchEvent(new KeyboardEvent('keyup', { code: 'ShiftLeft' })); }, face);
    for (const n of face > 0 ? [0, 2, 4, 8, 14, 22, 34] : [8]) {
      await p.evaluate((n) => { window.__pn = window.__pn || 0; while (window.__pn < n) { __step(1 / 60, 1); window.__pn++; } }, n);
      const f = OUT + `parry-${face}-${n}.png`; await p.screenshot({ path: f, clip: { x: box.x + 380 * k, y: box.y + 370 * k, width: 240 * k, height: 190 * k } }); fs_.push(f);
    }
    await p.evaluate(() => { window.__pn = 0; });
  }
  execSync(`python3 ${__dirname}/grid.py ${OUT}sword-parry.png 4 0.6 ${fs_.join(' ')}`);
  console.log('errors', errs); await b.close();
})();

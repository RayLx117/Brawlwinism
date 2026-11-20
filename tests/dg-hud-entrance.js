// The Divine General's entrance on the HUD: his portrait flies in and knocks his owner's out of its slot. Frame sheet to
// out/dg-hud-entrance.png (each frame: the bottom of the screen). Runs for both owners.
const { chromium } = require('playwright'); const path = require('path'), fs = require('fs'), { execSync } = require('child_process');
const GAME = 'file://' + path.resolve(__dirname, '../index.html'); const OUT = path.join(__dirname, 'out') + '/'; fs.mkdirSync(OUT, { recursive: true });
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1 });
  const errs = []; p.on('pageerror', e => errs.push(e.message)); await p.goto(GAME); await p.waitForTimeout(500);
  const box = await p.locator('canvas').boundingBox(), k = box.width / 1280;
  for (const owner of ['bot', 'pl']) {
    await p.evaluate((o) => { __startPractice(); const L = __cards.LOADOUT; L.pl.companion = o === 'pl' ? 'divineGeneral' : null; L.bot.companion = o === 'bot' ? 'divineGeneral' : null; __resetRound(); window.__h = { t: 0 }; }, owner);
    // step until he lands, then shoot the HUD at set times after
    await p.evaluate(() => { for (let i = 0; i < 400 && __dg().hudT0 === undefined; i++) __step(1 / 60, 1); });
    const frames = [];
    for (const ts of [0, 0.08, 0.16, 0.22, 0.28, 0.36, 0.46, 0.6, 0.8, 1.2]) {
      await p.evaluate((ts) => { const g = __dg(); while (g.time - g.hudT0 < ts - 1e-6) __step(1 / 60, 1); }, ts);
      const f = OUT + `hudin-${owner}-${String(ts).replace('.', '_')}.png`;
      await p.screenshot({ path: f, clip: { x: box.x + 220 * k, y: box.y + 470 * k, width: 840 * k, height: 250 * k } }); frames.push(f);
    }
    execSync(`python3 ${__dirname}/grid.py ${OUT}dg-hud-entrance-${owner}.png 5 0.6 ${frames.join(' ')}`);
  }
  console.log('errors', errs); await b.close();
})();

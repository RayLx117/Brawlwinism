// The Practice stage: a full screenshot with both fighters standing, and a close-up of the wall corner. Screenshots to out/.
const { chromium } = require('playwright'); const path = require('path'), fs = require('fs');
const OUT = path.join(__dirname, 'out') + '/'; fs.mkdirSync(OUT, { recursive: true });
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 2 }); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('file://' + path.resolve(__dirname, '../index.html')); await p.waitForTimeout(500);
  await p.evaluate(() => { __startPractice(); __cards.LOADOUT.bot.companion = null; __resetRound(); Object.assign(__bot, { x: 1120 }); Object.assign(__fighter, { x: 420 }); __step(1 / 60, 60); });
  const box = await p.locator('canvas').boundingBox();
  await p.screenshot({ path: OUT + 'stage.png', clip: box });
  await p.screenshot({ path: OUT + 'stage-corner.png', clip: { x: box.x + box.width * 0.72, y: box.y + box.height * 0.5, width: box.width * 0.28, height: box.height * 0.5 } });
  await p.screenshot({ path: OUT + 'stage-edge.png', clip: { x: box.x, y: box.y + box.height * 0.6, width: box.width * 0.35, height: box.height * 0.4 } });
  console.log('errors', errs); await b.close();
})();

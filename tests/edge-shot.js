// The stage's open edge, up close: the corner's ink work, and a fighter in four places around it (standing on the lip, just off
// it level with the floor, hanging below it on the cliff, and jumping past it above). Sheet to out/edge.png.
const { chromium } = require('playwright'); const path = require('path'), fs = require('fs'), { execSync } = require('child_process');
const OUT = path.join(__dirname, 'out') + '/'; fs.mkdirSync(OUT, { recursive: true });
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 3 }); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('file://' + path.resolve(__dirname, '../index.html')); await p.waitForTimeout(400);
  await p.evaluate(() => { __startPractice(); __cards.LOADOUT.bot.companion = null; __resetRound(); __bot.x = 900; __step(1 / 60, 10); });
  const box = await p.locator('canvas').boundingBox(), k = box.width / 1280, fs_ = [];
  const shot = async (name, setup, n) => {
    await p.evaluate(([setup, n]) => { eval(setup); __step(1 / 60, n); }, [setup, n]);
    const f = OUT + `edge-${name}.png`; await p.screenshot({ path: f, clip: { x: box.x + 40 * k, y: box.y + 430 * k, width: 260 * k, height: 260 * k } }); fs_.push(f);
  };
  await shot('empty', "Object.assign(__fighter, { x: 500, y: 540, vx: 0, vy: 0, onGround: true });", 2);
  await shot('on-lip', "Object.assign(__fighter, { x: 162, y: 540, vx: 0, vy: 0, onGround: true, facing: -1 });", 2);
  await shot('off-level', "Object.assign(__fighter, { x: 128, y: 552, vx: 0, vy: 0, onGround: false, facing: 1 });", 1);
  await shot('hanging', "Object.assign(__fighter, { x: 115, y: 620, vx: 200, vy: -100, onGround: false, facing: 1 }); window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyD' }));", 12);
  await p.evaluate(() => window.dispatchEvent(new KeyboardEvent('keyup', { code: 'KeyD' })));
  await shot('above', "Object.assign(__fighter, { x: 120, y: 470, vx: 0, vy: 0, onGround: false, facing: 1 });", 1);
  execSync(`python3 ${__dirname}/grid.py ${OUT}edge.png 5 0.45 ${fs_.join(' ')}`);
  console.log('errors', errs); await b.close();
})();

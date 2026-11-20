// Close-up of the pierce's flash jab and its sound-barrier burst (no hitbox view), the player stepping away so it misses.
// Frames from just before the flash to after; sheet at out/flash.png.
const { chromium } = require('playwright'); const path = require('path'), fs = require('fs'), { execSync } = require('child_process');
const GAME = 'file://' + path.resolve(__dirname, '../index.html'); const OUT = path.join(__dirname, 'out') + '/'; fs.mkdirSync(OUT, { recursive: true });
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 2 });
  const errs = []; p.on('pageerror', e => errs.push(e.message)); await p.goto(GAME); await p.waitForTimeout(500);
  const box = await p.locator('canvas').boundingBox(), k = box.width / 1280;
  await p.evaluate(() => {
    __startPractice(); __cards.LOADOUT.pl.companion = null; __cards.LOADOUT.bot.companion = 'divineGeneral'; __resetRound(); __step(1 / 60, 200);
    const g = __dg(); Object.assign(g, { x: 480, y: 540, state: 'idle', gapT: 999, facing: 1, rot: 0 });
    Object.assign(__fighter, { x: 800, y: 470, vx: 0, vy: 0, rag: null, onGround: false, damage: 30, stunT: 0 }); __step(1 / 60, 1); __dgStart('pierce'); window.__t = 0;
  });
  const frames = [];
  for (const ts of [1.1, 1.22, 1.3, 1.317, 1.333, 1.367, 1.4, 1.45, 1.5, 1.6]) {
    await p.evaluate((ts) => { while (window.__t < ts - 1e-6) { if (window.__t < 1.15) Object.assign(__fighter, { x: 800, y: 470, vx: 0, vy: 0 }); else Object.assign(__fighter, { x: 250, y: 540, vx: 0, vy: 0, onGround: true }); __step(1 / 60, 1); window.__t += 1 / 60; } }, ts);
    const f = OUT + `flash-${String(ts).replace('.', '_')}.png`; await p.screenshot({ path: f, clip: { x: box.x + 380 * k, y: box.y + 180 * k, width: 600 * k, height: 380 * k } }); frames.push(f);
  }
  execSync(`python3 ${__dirname}/grid.py ${OUT}flash.png 5 0.5 ${frames.join(' ')}`);
  console.log('errors', errs); await b.close();
})();

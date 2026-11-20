// Close-ups of the pierce's warning halo over the player: standing and in the air. Screenshots to out/.
const { chromium } = require('playwright'); const path = require('path'), fs = require('fs');
const GAME = 'file://' + path.resolve(__dirname, '../index.html'); const OUT = path.join(__dirname, 'out') + '/'; fs.mkdirSync(OUT, { recursive: true });
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1300, height: 820 }, deviceScaleFactor: 2 });
  const errs = []; p.on('pageerror', e => errs.push(e.stack)); await p.goto(GAME); await p.waitForTimeout(600);
  const box = await p.locator('canvas').boundingBox(), k = box.width / 1280;
  for (const [name, x, h, face] of [['ground', 900, 0, -1], ['air', 860, 200, 1]]) {
    const r = await p.evaluate(([x, h, face]) => {
      __startPractice(); __cards.LOADOUT.pl.companion = null; __cards.LOADOUT.bot.companion = 'divineGeneral'; __resetRound(); __step(1 / 60, 200);
      const g = __dg(); Object.assign(g, { x: 560, y: 540, state: 'idle', gapT: 999, facing: 1 });
      Object.assign(__fighter, { x, y: 540 - h, vx: 0, vy: 0, rag: null, onGround: h === 0, facing: face });
      __step(1 / 60, 1); __dgStart('pierce');
      for (let i = 0; i < 9; i++) { Object.assign(__fighter, { x, y: 540 - h, vx: 0, vy: 0 }); __step(1 / 60, 1); }
      return [__fighter.x, __fighter.y];
    }, [x, h, face]);
    await p.screenshot({ path: OUT + `crown-${name}.png`, clip: { x: box.x + (r[0] - 110) * k, y: box.y + (r[1] - 190) * k, width: 220 * k, height: 220 * k } });
  }
  console.log('errors', errs); await b.close();
})();

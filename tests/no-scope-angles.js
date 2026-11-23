// No Scope aimed at targets at different heights: the chest turns to face each, the arms hold the rifle the same way. Each frame is
// the locked aim just before the shot. Sheet: out/no-scope-angles.png.
const { chromium } = require('playwright'); const path = require('path'), fs = require('fs'), { execSync } = require('child_process');
const OUT = path.join(__dirname, 'out') + '/'; fs.mkdirSync(OUT, { recursive: true });
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 2 }); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('file://' + path.resolve(__dirname, '../index.html')); await p.waitForTimeout(300);
  const box = await p.locator('canvas').boundingBox(), k = box.width / 1280, fs_ = [], res = [];
  for (const [bx, by] of [[860, 520], [860, 380], [760, 160], [600, 60], [1000, 480]]) {
    const r = await p.evaluate(([bx, by]) => {
      __startPractice(); const L = __cards.LOADOUT; L.bot.companion = null; L.pl.weapon = null; L.pl.passives = ['noScope']; __resetRound(); __step(1 / 60, 10);
      Object.assign(__fighter, { x: 420, facing: 1 }); Object.assign(__bot, { x: 800, damage: 60 });
      const ev = (c) => { window.dispatchEvent(new KeyboardEvent('keydown', { code: c })); window.dispatchEvent(new KeyboardEvent('keyup', { code: c })); };
      Object.assign(__fighter, { x: 760 }); __fighter.punch.next = 2; __fighter.punch.lastEnd = __fighter.time; window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyD' })); ev('KeyJ');
      for (let i = 0; i < 40 && !__bot.rag; i++) __tick(1 / 60); window.dispatchEvent(new KeyboardEvent('keyup', { code: 'KeyD' }));
      const hold = () => { if (__bot.rag) { Object.assign(__bot, { x: bx, y: by, vx: 0, vy: 0 }); __bot.rag.left = 3; } };
      for (let i = 0; i < 30; i++) { __fighter.punch.on = false; Object.assign(__fighter, { x: 420, vx: 0, facing: 1 }); hold(); __tick(1 / 60); }
      ev('KeyX'); for (let i = 0; i < 39; i++) { __fighter.punch.on = false; Object.assign(__fighter, { x: 420, vx: 0 }); hold(); __step(1 / 60, 1); }
      const d0 = __bot.damage; for (let i = 0; i < 4; i++) { hold(); __step(1 / 60, 1); }   // a few frames on: the shot
      return __bot.damage - d0;
    }, [bx, by]);
    res.push(r);
    const f = OUT + `nsg-${fs_.length}.png`; await p.screenshot({ path: f, clip: { x: box.x + 300 * k, y: box.y + 20 * k, width: 760 * k, height: 560 * k } }); fs_.push(f);
  }
  execSync(`python3 ${__dirname}/grid.py ${OUT}no-scope-angles.png 5 0.35 ${fs_.join(' ')}`);
  console.log('hit damage per angle', JSON.stringify(res), 'errors', errs); await b.close();
})();

// No Scope's pull-out, every frame from the X press to past the shot: a close crop of the shooter. Sheet: out/pullout-frames.png
const { chromium } = require('playwright'); const path = require('path'), fs = require('fs'), { execSync } = require('child_process');
const OUT = path.join(__dirname, 'out') + '/'; fs.mkdirSync(OUT, { recursive: true });
const N = +(process.env.N || 30), EVERY = +(process.env.EVERY || 1);
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 2 }); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('file://' + path.resolve(__dirname, '../index.html')); await p.waitForTimeout(300);
  const box = await p.locator('canvas').boundingBox(), k = box.width / 1280, fs_ = [];
  const fr = await p.evaluate(() => { __startPractice(); const L = __cards.LOADOUT; L.bot.companion = null; L.pl.weapon = null; L.pl.passives = ['noScope']; __resetRound(); __step(1 / 60, 10);
    const ev = (c) => { window.dispatchEvent(new KeyboardEvent('keydown', { code: c })); window.dispatchEvent(new KeyboardEvent('keyup', { code: c })); };
    Object.assign(__bot, { x: 800, damage: 60 }); Object.assign(__fighter, { x: 760, facing: 1 }); __fighter.punch.next = 2; __fighter.punch.lastEnd = __fighter.time; window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyD' })); ev('KeyJ');
    for (let i = 0; i < 40 && !__bot.rag; i++) __tick(1 / 60); window.dispatchEvent(new KeyboardEvent('keyup', { code: 'KeyD' }));
    window.__hold = () => { if (__bot.rag) { Object.assign(__bot, { x: 880, y: 470, vx: 0, vy: 0 }); __bot.rag.left = 3; } };
    for (let i = 0; i < 40; i++) { __fighter.punch.on = false; Object.assign(__fighter, { x: 420, vx: 0, facing: 1 }); __hold(); __tick(1 / 60); }
    __step(1 / 60, 1); ev('KeyX'); return [__fighter.x, __fighter.y]; });
  for (let i = 0; i < N; i++) {
    await p.evaluate((e) => { for (let j = 0; j < e; j++) { Object.assign(__fighter, { x: 420, vx: 0 }); if (!__fighter.snipe || !__fighter.snipe.fired) __hold(); __step(1 / 60, 1); } }, EVERY);
    const f = OUT + `pof-${i}.png`; await p.screenshot({ path: f, clip: { x: box.x + (fr[0] - 70) * k, y: box.y + (fr[1] - 175) * k, width: 220 * k, height: 190 * k } }); fs_.push(f);
  }
  execSync(`python3 ${__dirname}/grid.py ${OUT}pullout-frames.png 6 0.5 ${fs_.join(' ')}`);
  console.log('errors', errs); await b.close();
})();

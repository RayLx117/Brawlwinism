// Wall jumps up the cliff face under the stage's left edge: start beside it below the floor, hold right (into it) and press jump
// again and again: you should climb back up onto the stage. Runs on this build and on the published main for comparison.
const { chromium } = require('playwright'); const path = require('path'), { execSync } = require('child_process');
(async () => { const b = await chromium.launch(); const out = {};
execSync(`git -C ${path.resolve(__dirname, '..')} show origin/main:index.html > ${__dirname}/out/before-main.html`);
for (const [name, file] of [['main', 'out/before-main.html'], ['now', '../index.html']]) {
  const p = await b.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('file://' + path.resolve(__dirname, file)); await p.waitForTimeout(200);
  out[name] = await p.evaluate(() => { __startPractice(); __resetRound(); __step(1 / 60, 10);
    Object.assign(__fighter, { x: 120, y: 640, vx: 0, vy: -200, onGround: false, facing: 1 }); Object.assign(__bot, { x: 1000 });
    const K = (c, d) => window.dispatchEvent(new KeyboardEvent(d ? 'keydown' : 'keyup', { code: c })); K('KeyD', 1);
    let minY = 999, onStage = false, slid = 0; for (let i = 0; i < 240; i++) { if (i % 14 === 0) K('Space', 1); if (i % 14 === 4) K('Space', 0); __step(1 / 60, 1); minY = Math.min(minY, __fighter.y); if (__fighter.wallSlide) slid++; if (__fighter.onGround && __fighter.x > 150) onStage = true; }
    K('KeyD', 0); return { climbedTo: Math.round(minY), backOnStage: onStage, slideFrames: slid, x: Math.round(__fighter.x) }; });
  out[name].errors = errs; await p.close(); }
console.log(JSON.stringify(out)); await b.close(); process.exit(out.now.backOnStage ? 0 : 1); })();

// The Divine General's blade swing trail: cleave, heaven strike and sweep, frame by frame (normal view). Sheet: out/dg-swing.png.
const { chromium } = require('playwright'); const path = require('path'), fs = require('fs'), { execSync } = require('child_process');
const OUT = path.join(__dirname, 'out') + '/'; fs.mkdirSync(OUT, { recursive: true });
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1 }); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('file://' + path.resolve(__dirname, '../index.html')); await p.waitForTimeout(400);
  const box = await p.locator('canvas').boundingBox(), rows = [];
  for (const [k, x, h, times] of [['cleave', 820, 0, [0.4, 0.45, 0.5, 0.55, 0.62, 0.75]], ['heaven', 600, 250, [0.36, 0.42, 0.48, 0.54, 0.6, 0.72]], ['sweep', 860, 60, [0.47, 0.52, 0.57, 0.62, 0.7, 0.85]]]) {
    await p.evaluate(([k, x, h]) => {
      __startPractice(); __cards.LOADOUT.pl.companion = null; __cards.LOADOUT.bot.companion = 'divineGeneral'; __resetRound(); __step(1 / 60, 200);
      const g = __dg(); Object.assign(g, { x: 560, y: 540, state: 'idle', gapT: 999, facing: 1, rot: 0 });
      Object.assign(__fighter, { x, y: 540 - h, vx: 0, vy: 0, rag: null, onGround: h === 0 }); __step(1 / 60, 1); __dgStart(k); window.__t = 0; window.__hold = [x, 540 - h];
    }, [k, x, h]);
    const fr = [];
    for (const ts of times) {
      await p.evaluate((ts) => { while (window.__t < ts - 1e-6) { if (!__fighter.rag) Object.assign(__fighter, { x: 250, y: 540, vx: 0, vy: 0 }); __step(1 / 60, 1); window.__t += 1 / 60; } }, ts);
      const f = OUT + `swing-${k}-${String(ts).replace('.', '_')}.png`; await p.screenshot({ path: f, clip: { x: box.x + 120, y: box.y, width: 900, height: 640 } }); fr.push(f);
    }
    execSync(`python3 ${__dirname}/join.py ${OUT}swing-${k}.png ${fr.join(' ')}`); rows.push(OUT + `swing-${k}.png`);
  }
  execSync(`python3 ${__dirname}/grid.py ${OUT}dg-swing.png 1 1 ${rows.join(' ')}`);
  console.log('errors', errs); await b.close();
})();

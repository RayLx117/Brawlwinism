// Quake into sweep on the player: once taking it, once parrying the moment the stun wears off. Frame sheets to out/sweep-*.png.
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs'), { execSync } = require('child_process');
const GAME = 'file://' + path.resolve(__dirname, '../index.html'); const OUT = path.join(__dirname, 'out') + '/'; fs.mkdirSync(OUT, { recursive: true });
const SHOTS = [0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 0.98, 1.03, 1.08, 1.15, 1.3, 1.6];
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1300, height: 820 }, deviceScaleFactor: 1 });
  const errs = []; p.on('pageerror', e => errs.push(e.stack)); await p.goto(GAME); await p.waitForTimeout(600);
  const box = await p.locator('canvas').boundingBox(), k = box.width / 1280;
  for (const [name, x, parry] of [['take', 820, false], ['parry', 820, true], ['far', 960, false]]) {
    await p.evaluate(([x, parry]) => {
      __startPractice(); const L = __cards.LOADOUT; L.pl.companion = null; L.bot.companion = 'divineGeneral';
      __resetRound(); __step(1 / 60, 240);
      const g = __dg(); Object.assign(g, { x: 560, y: 540, state: 'idle', gapT: 999, facing: 1, rot: 0 });
      Object.assign(__fighter, { x, y: 540, vx: 0, vy: 0, rag: null, onGround: true, damage: 30, parryCd: 0, parryT: 0, stunT: 0, staggerT: 0, lockT: 0 });
      __step(1 / 60, 1); __dgStart('quake'); window.__h = { t: 0, parry, log: [] };
    }, [x, parry]);
    const frames = [];
    for (const ts of SHOTS) {
      await p.evaluate((ts) => {
        const H = window.__h, g = __dg();
        while (H.t < ts - 1e-6) {
          if (H.parry && !H.pressed && H.stunned && !(__fighter.stunT > 0)) {   // stun just ran out: tap shift
            H.pressed = true; window.dispatchEvent(new KeyboardEvent('keydown', { code: 'ShiftLeft' })); H.log.push('parry at ' + H.t.toFixed(2));
          } else if (H.pressed && !H.released) { H.released = true; window.dispatchEvent(new KeyboardEvent('keyup', { code: 'ShiftLeft' })); }
          if (__fighter.stunT > 0) H.stunned = true;
          __step(1 / 60, 1); H.t += 1 / 60;
          const st = g && g.state === 'atk' ? g.atk.A.key : g && g.state; if (st !== H.last) { H.log.push(H.t.toFixed(2) + ' ' + st); H.last = st; }
          if (__fighter.rag && !H.rag) { H.rag = true; H.log.push(H.t.toFixed(2) + ' ragdoll vx ' + (__fighter.vx | 0) + ' vy ' + (__fighter.vy | 0)); }
          if (g && g.label && !H.lab) { H.lab = true; H.log.push(H.t.toFixed(2) + ' label: ' + g.label); }
        }
      }, ts);
      const fn = OUT + `sweep-${name}-${String(ts).replace('.', '_')}.png`;
      await p.screenshot({ path: fn, clip: { x: box.x + 280 * k, y: box.y, width: 820 * k, height: 600 * k } }); frames.push(fn);
    }
    console.log(name, JSON.stringify(await p.evaluate(() => ({ log: window.__h.log, dmg: __fighter.damage }))));
    execSync(`python3 ${__dirname}/grid.py ${OUT}sweep-${name}.png 6 0.42 ${frames.join(' ')}`);
  }
  console.log('errors', errs); await b.close();
})();

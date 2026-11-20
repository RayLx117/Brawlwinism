// The Divine General's pierce from several angles: the player is held in place (on the floor or hanging in the air) until the
// blade connects, then let go. Prints when it hit and where they ended up; writes a frame strip per case (out/pierce-<case>.png
// frames, joined with grid.py). usage: node dg-pierce.js
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs'), { execSync } = require('child_process');
const GAME = 'file://' + path.resolve(__dirname, '../index.html'); const OUT = path.join(__dirname, 'out') + '/'; fs.mkdirSync(OUT, { recursive: true });
const CASES = [   // [name, player x offset in front of him, player height above the floor]
  ['near', 150, 0], ['far', 400, 0], ['high', 220, 300], ['overhead', 70, 380], ['low-air', 330, 120],
];
const SHOTS = [0.15, 0.3, 0.36, 0.42, 0.5, 0.6, 1.2, 1.5, 1.6, 1.66, 1.72, 1.85, 2.0, 2.2, 2.6, 3.0];
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1300, height: 820 }, deviceScaleFactor: 1 });
  const errs = []; p.on('pageerror', e => errs.push(e.stack)); await p.goto(GAME); await p.waitForTimeout(600);
  const box = await p.locator('canvas').boundingBox(), k = box.width / 1280;
  for (const [name, off, h] of CASES) {
    await p.evaluate(() => { __startPractice(); __cards.LOADOUT.pl.companion = null; __cards.LOADOUT.bot.companion = 'divineGeneral'; __resetRound(); __step(1 / 60, 200); });
    await p.evaluate(([off, h]) => {
      const g = __dg(); Object.assign(g, { x: 560, y: 540, state: 'idle', gapT: 999, facing: 1, rot: 0 });
      Object.assign(__fighter, { x: 560 + off, y: 540 - h, vx: 0, vy: 0, rag: null, onGround: h === 0, damage: 40 });
      __step(1 / 60, 1); __dgStart('pierce'); window.__pt = { hold: [560 + off, 540 - h], t: 0, hitT: null };
    }, [off, h]);
    const frames = [];
    for (const ts of SHOTS) {
      const r = await p.evaluate((ts) => {
        const P = window.__pt, g = __dg();
        while (P.t < ts - 1e-6) {
          if (P.hitT === null && !__fighter.rag) Object.assign(__fighter, { x: P.hold[0], y: P.hold[1], vx: 0, vy: 0 });
          __step(1 / 60, 1); P.t += 1 / 60;
          if (P.hitT === null && g && g.pin) P.hitT = +P.t.toFixed(3);
        }
        return { hitT: P.hitT, dmg: __fighter.damage, ragLeft: __fighter.rag && +__fighter.rag.left.toFixed(2), x: __fighter.x | 0, y: __fighter.y | 0, rag: !!__fighter.rag, pinned: !!(g && g.pin), dg: g && g.state, gx: g && g.x | 0 };
      }, ts);
      const fn = OUT + `pierce-${name}-${String(ts).replace('.', '_')}.png`;
      await p.screenshot({ path: fn, clip: { x: box.x + 200 * k, y: box.y, width: 900 * k, height: 600 * k } });
      frames.push(fn);
      if (ts === SHOTS[SHOTS.length - 1]) console.log(name.padEnd(9), JSON.stringify(r));
    }
    execSync(`python3 ${__dirname}/grid.py ${OUT}pierce-${name}.png 6 0.42 ${frames.join(' ')}`);
  }
  console.log('errors', errs); await b.close();
})();

// The Divine General's quake stomp: forced on the player (and on the bot, with the card swapped), frame strips to out/quake-*.png.
// Prints whether the target was hit, their stun, how high they were popped, and that they weren't ragdolled.
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs'), { execSync } = require('child_process');
const GAME = 'file://' + path.resolve(__dirname, '../index.html'); const OUT = path.join(__dirname, 'out') + '/'; fs.mkdirSync(OUT, { recursive: true });
const SHOTS = [0.05, 0.15, 0.25, 0.35, 0.43, 0.47, 0.52, 0.6, 0.75, 0.95, 1.2, 1.5];
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1300, height: 820 }, deviceScaleFactor: 1 });
  const errs = []; p.on('pageerror', e => errs.push(e.stack)); await p.goto(GAME); await p.waitForTimeout(600);
  const box = await p.locator('canvas').boundingBox(), k = box.width / 1280;
  for (const who of ['player', 'bot']) {
    await p.evaluate((who) => {
      __startPractice(); const L = __cards.LOADOUT; L.pl.companion = who === 'bot' ? 'divineGeneral' : null; L.bot.companion = who === 'bot' ? null : 'divineGeneral';
      __resetRound(); __step(1 / 60, 240);
      const g = __dg(); Object.assign(g, { x: 560, y: 540, state: 'idle', gapT: 999, facing: 1, rot: 0 });
      const T = who === 'bot' ? __bot : __fighter;
      Object.assign(T, { x: 820, y: 540, vx: 0, vy: 0, rag: null, onGround: true, damage: 30, dead: 0, out: false });
      if (who === 'bot') Object.assign(__fighter, { x: 200 });
      __step(1 / 60, 1); __dgStart('quake'); window.__q = { t: 0, who, maxUp: 0, y0: 540, stun: 0, rag: false, dmg0: 30 };
    }, who);
    const frames = [];
    for (const ts of SHOTS) {
      await p.evaluate((ts) => {
        const Q = window.__q, T = Q.who === 'bot' ? __bot : __fighter;
        while (Q.t < ts - 1e-6) { __step(1 / 60, 1); Q.t += 1 / 60; Q.maxUp = Math.max(Q.maxUp, Q.y0 - T.y); Q.stun = Math.max(Q.stun, T.stunT || 0); Q.rag = Q.rag || !!T.rag; }
      }, ts);
      const fn = OUT + `quake-${who}-${String(ts).replace('.', '_')}.png`;
      await p.screenshot({ path: fn, clip: { x: box.x + 280 * k, y: box.y, width: 760 * k, height: 600 * k } }); frames.push(fn);
    }
    console.log(who.padEnd(7), JSON.stringify(await p.evaluate(() => { const Q = window.__q, T = Q.who === 'bot' ? __bot : __fighter; return { hitDmg: T.damage - Q.dmg0, maxStun: +Q.stun.toFixed(2), poppedPx: Q.maxUp | 0, ragdolled: Q.rag }; })));
    execSync(`python3 ${__dirname}/grid.py ${OUT}quake-${who}.png 6 0.42 ${frames.join(' ')}`);
  }
  console.log('errors', errs); await b.close();
})();

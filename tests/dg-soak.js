// Lets the Divine General fight the player on his own for a while (player hops between spots), logs the attacks he picks.
const { chromium } = require('playwright'); const path = require('path');
const GAME = 'file://' + path.resolve(__dirname, '../index.html');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.stack));
  await p.goto(GAME); await p.waitForTimeout(500);
  const r = await p.evaluate(() => {
    __startPractice(); __cards.LOADOUT.pl.companion = null; __cards.LOADOUT.bot.companion = 'divineGeneral'; __resetRound();
    const seq = [], spots = [[300, 0], [700, 0], [900, 250], [620, 330], [1000, 0], [450, 150]]; let last = null, hits = 0, rounds = 0;
    for (let i = 0; i < 60 * 90; i++) {
      const g = __dg();
      if (i % 150 === 0 && !__fighter.rag && !__fighter.out) { const [x, h] = spots[(i / 150) % spots.length]; Object.assign(__fighter, { x, y: 540 - h, vx: 0, vy: 0, damage: 30 }); }
      if (!__fighter.rag && __fighter.y < 540) __fighter.vy = 0;   // hang in the air at the chosen spot
      __tick(1 / 60);
      if (g && g.state === 'atk' && g.atk !== last) { last = g.atk; seq.push(g.atk.A.key); }
      if (g && g.pin && !g.__c) { hits++; g.__c = 1; } else if (g && !g.pin) g.__c = 0;
      if (!__dg()) { rounds++; __resetRound(); }
    }
    const rep = seq.filter((k, i) => i && seq[i - 1] === k).length, count = {};
    seq.forEach(k => count[k] = (count[k] || 0) + 1);
    return { n: seq.length, count, repeats: rep, pierceSkewers: hits, seq: seq.slice(0, 30).join(' ') };
  });
  console.log(JSON.stringify(r, null, 1)); console.log('errors', errs); await b.close();
})();

// Up-air (flip kick) loop: the player jumps under the bot and spams flip kicks, holding up and staying under it. Prints when each
// kick lands and how much of the bot's stun was left at that moment (stun left > 0 = the bot never got free, a true combo).
// usage: node uair-loop.js [stun override]
const { chromium } = require('playwright'); const path = require('path');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('file://' + path.resolve(__dirname, '../index.html')); await p.waitForTimeout(300);
  const r = await p.evaluate((ov) => {
    __startPractice(); const L = __cards.LOADOUT; L.bot.companion = null; L.pl.weapon = null; __resetRound(); __step(1 / 60, 20);
    const ev = (t, c) => window.dispatchEvent(new KeyboardEvent(t, { code: c }));
    Object.assign(__bot, { x: 640, y: 540, damage: 40 }); Object.assign(__fighter, { x: 640, y: 540, facing: 1 }); __step(1 / 60, 5);
    ev('keydown', 'KeyW'); ev('keydown', 'Space'); __step(1 / 60, 1); ev('keyup', 'Space');
    const hits = []; let lastStun = 0, t = 0, first = true;
    for (let i = 0; i < 60 * 4; i++) {
      __fighter.x = __bot.x;   // stay right under it
      if (i % 3 === 0) { ev('keydown', 'KeyJ'); ev('keyup', 'KeyJ'); }
      const before = __bot.stunT, d0 = __bot.damage;
      __tick(1 / 60); t += 1 / 60;
      if (__bot.damage > d0) { hits.push({ t: +t.toFixed(2), move: __bot.move, stunLeft: +before.toFixed(2), combo: __bot.combo, botY: __bot.y | 0 }); }
      if (__fighter.onGround && i > 30) { ev('keydown', 'Space'); __tick(1 / 60); ev('keyup', 'Space'); }
    }
    ev('keyup', 'KeyW'); return hits;
  });
  console.log(JSON.stringify(r)); console.log('errors', errs); await b.close();
})();

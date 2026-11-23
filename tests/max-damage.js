// A fighter's own damage cap (maxDmg, for cards that raise it): the same hit at the same SHARE of the cap launches the same, and at
// the same raw % launches less when the cap is higher. Also checks the cap holds. Prints sucker punch launches on the bot.
const { chromium } = require('playwright'); const path = require('path');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('file://' + path.resolve(__dirname, '../index.html')); await p.waitForTimeout(300);
  const r = await p.evaluate(() => {
    __startPractice(); const L = __cards.LOADOUT; L.bot.companion = null; L.pl.weapon = null; __resetRound(); __step(1 / 60, 20);
    const ev = (t, c) => window.dispatchEvent(new KeyboardEvent(t, { code: c })), out = [];
    for (const [max, dmg] of [[150, 75], [300, 150], [300, 75], [150, 150], [300, 300]]) {
      __resetRound(); __step(1 / 60, 10);
      Object.assign(__bot, { x: 700, damage: dmg, maxDmg: max === 150 ? undefined : max, rag: null }); Object.assign(__fighter, { x: 640, facing: 1 }); __fighter.punch.on = false;
      __fighter.punch.next = 2; __fighter.punch.lastEnd = __fighter.time; ev('keydown', 'KeyD');
      ev('keydown', 'KeyJ'); ev('keyup', 'KeyJ');
      let vx = null; for (let i = 0; i < 40 && vx === null; i++) { __tick(1 / 60); if (__bot.rag) vx = __bot.vx | 0; }
      ev('keyup', 'KeyD');
      out.push({ max, dmg, launchVx: vx, ragLeft: __bot.rag ? +__bot.rag.left.toFixed(2) : null });
    }
    // the cap: a jab on a 300-cap bot at 299% stops at 300, and on a normal bot at 149% stops at 150
    for (const [max, dmg] of [[300, 299], [150, 149]]) {
      __resetRound(); __step(1 / 60, 10); Object.assign(__bot, { x: 700, damage: dmg, maxDmg: max === 150 ? undefined : max }); Object.assign(__fighter, { x: 640, facing: 1 }); __fighter.punch.on = false; __fighter.punch.next = 0;
      ev('keydown', 'KeyJ'); ev('keyup', 'KeyJ'); for (let i = 0; i < 20; i++) __tick(1 / 60);
      out.push({ capCheck: max, after: __bot.damage });
    }
    return out;
  });
  for (const x of r) console.log(JSON.stringify(x));
  console.log('errors', errs); await b.close();
})();

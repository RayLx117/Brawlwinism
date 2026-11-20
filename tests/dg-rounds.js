// Several Divine General rounds in a row (the round restarting each time): his portrait's number must stay normal size.
// Checks the swell factor his HUD uses after each new spawn, and screenshots the HUD at the end (out/dg-rounds.png).
const { chromium } = require('playwright'); const path = require('path');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1280, height: 720 } }); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('file://' + path.resolve(__dirname, '../index.html')); await p.waitForTimeout(400);
  const r = await p.evaluate(() => {
    __startPractice(); __cards.LOADOUT.bot.companion = 'divineGeneral'; __resetRound(); const out = [];
    for (let round = 0; round < 4; round++) {
      for (let i = 0; i < 60 * 12; i++) { __tick(1 / 60); const g = __dg(); if (g && g.time > 3 && g.damage < 30) g.damage += 0.05; }   // let him fight and take some damage
      __resetRound(); __step(1 / 60, 90); out.push(__dg() ? +__dg().time.toFixed(1) : null);
    }
    __step(1 / 60, 60); return out;
  });
  await p.screenshot({ path: path.join(__dirname, 'out/dg-rounds.png') });
  console.log('his clock after each new spawn', r, 'errors', errs); await b.close();
})();

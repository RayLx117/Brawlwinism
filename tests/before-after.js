// Before / after the rollback restructure: the same scripted inputs on the main build (out/before-main.html, made with
// `git show origin/main:index.html > out/before-main.html`) and on this build. One sheet per scenario: top row before, bottom row after.
// Sheets: out/ba-<scenario>.png
const { chromium } = require('playwright'); const path = require('path'), fs = require('fs'), { execSync } = require('child_process');
const OUT = path.join(__dirname, 'out') + '/';
const SC = {
  fists: { bot: 520, botDmg: 30, steps: [[0, 'KeyJ'], [16, 'KeyJ'], [34, 'KeyJ']], shots: [6, 18, 26, 40, 52, 64, 80, 100], clip: [380, 200, 520, 360] },
  parryBot: { bot: 520, botMode: 'parry', steps: [[0, 'KeyJ']], shots: [3, 6, 9, 14, 24, 40], clip: [380, 340, 300, 220] },
  sword: { bot: 540, botDmg: 30, sword: true, steps: [[0, 'KeyJ'], [8, 'KeyJ']], shots: [8, 13, 20, 30, 40, 48, 54, 62], clip: [380, 220, 420, 340] },
};
(async () => {
  const b = await chromium.launch();
  for (const [name, S] of Object.entries(SC)) {
    const files = [];
    for (const build of [OUT + 'before-main.html', path.resolve(__dirname, '../index.html')]) {
      const p = await b.newPage({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1.5 }); await p.goto('file://' + build); await p.waitForTimeout(250);
      await p.evaluate((S) => { const L = __cards.LOADOUT; __startPractice(); L.bot.companion = null; L.pl.passives = []; L.pl.companion = null;
        L.pl.weapon = S.sword ? 'sword' : null; L.pl.weaponSpec = S.sword ? { id: 'sword', rarity: 'common', base: 10, mods: [] } : null; __resetRound(); __step(1 / 60, 30);
        Object.assign(__fighter, { x: 420, vx: 0, facing: 1 }); Object.assign(__bot, { x: S.bot, damage: S.botDmg || 0 }); __bot.mode = S.botMode || 'dummy';
        for (let i = 0; i < 20; i++) { __bot.x = S.bot; __step(1 / 60, 1); } }, S);
      const box = await p.locator('canvas').boundingBox(), k = box.width / 1280; let f = 0;
      for (const at of S.shots) {
        await p.evaluate(([S, f, at]) => { for (; f < at; f++) { for (const [fr, c] of S.steps) if (fr === f) { window.dispatchEvent(new KeyboardEvent('keydown', { code: c })); window.dispatchEvent(new KeyboardEvent('keyup', { code: c })); } __step(1 / 60, 1); } }, [S, f, at]); f = at;
        const fn = OUT + `ba-${name}-${files.length}.png`; await p.screenshot({ path: fn, clip: { x: box.x + S.clip[0] * k, y: box.y + S.clip[1] * k, width: S.clip[2] * k, height: S.clip[3] * k } }); files.push(fn);
      }
      await p.close();
    }
    execSync(`python3 ${__dirname}/grid.py ${OUT}ba-${name}.png ${S.shots.length} 0.5 ${files.join(' ')}`);
  }
  await b.close(); console.log('done');
})();

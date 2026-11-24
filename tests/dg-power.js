// Divine General: his hits scale with his owner's weapon, and he only ragdolls at 500% (his cap). Prints the damage of one cleave
// with the owner unarmed and with a common, mythic and ancient sword; then a kill blow on him at 499% and at 500%.
const { chromium } = require('playwright'); const path = require('path');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('file://' + path.resolve(__dirname, '../index.html')); await p.waitForTimeout(300);
  const r = await p.evaluate(() => {
    const L = __cards.LOADOUT, out = {}; __startPractice();
    for (const [name, spec] of [['none', null], ['common 10', { rarity: 'common', base: 10 }], ['mythic 30', { rarity: 'mythic', base: 30 }], ['ancient 35', { rarity: 'ancient', base: 35 }]]) {
      L.pl.companion = null; L.bot.companion = 'divineGeneral'; L.bot.weapon = spec ? 'sword' : null; L.bot.weaponSpec = spec ? { id: 'sword', mods: [], ...spec } : null;
      __resetRound(); __step(1 / 60, 200);
      const g = __dg(); Object.assign(g, { x: 560, y: 540, state: 'idle', gapT: 999, facing: 1 }); Object.assign(__fighter, { x: 760, y: 540, vx: 0, vy: 0, rag: null, onGround: true, damage: 0, parryT: 0 });
      __step(1 / 60, 1); __dgStart('cleave'); for (let i = 0; i < 50 && !__fighter.rag; i++) { __fighter.x = 760; __step(1 / 60, 1); }
      out[name] = +__fighter.damage.toFixed(1);
    }
    // ragdoll threshold: an uppercut (a kill blow) on him at 499% and at 500%
    const rag = {};
    for (const d of [480, 500]) {
      L.bot.weapon = null; L.bot.weaponSpec = null; L.pl.weapon = null; __resetRound(); __step(1 / 60, 200);
      const g = __dg(); Object.assign(g, { x: 700, y: 540, state: 'idle', gapT: 999, facing: -1, damage: d });
      Object.assign(__fighter, { x: 600, y: 540, facing: 1, rag: null, onGround: true, vx: 0 }); __fighter.punch.on = false; __step(1 / 60, 2);
      const press = () => { window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyJ' })); window.dispatchEvent(new KeyboardEvent('keyup', { code: 'KeyJ' })); };
      for (let i = 0; i < 60 && g.state !== 'rag'; i++) { if (i % 12 === 0) press(); __fighter.x = Math.min(__fighter.x, g.x - 110); g.gapT = 999; __step(1 / 60, 1); if (__dg() !== g) break; }
      rag[d] = { state: g.state, dmg: +g.damage.toFixed(1) };
    }
    return { cleave: out, rag };
  });
  console.log('one cleave on the player, by owner weapon:', JSON.stringify(r.cleave), '(base 14)');
  console.log('a jab > cross > uppercut on him:', JSON.stringify(r.rag));
  console.log('errors', errs); await b.close();
})();

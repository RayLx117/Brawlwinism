// Every weapon modifier in an actual fight: for each one, a Rare sword with just that modifier hits the bot (and the Divine
// General, for the ones that can reach him) for a few seconds. Prints the damage dealt per modifier and checks for page errors.
// Also checks the stacking / curse / bless maths and Anchor saving a launched player.
const { chromium } = require('playwright'); const path = require('path');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.stack.split('\n').slice(0, 2).join(' ')));
  await p.goto('file://' + path.resolve(__dirname, '../index.html')); await p.waitForTimeout(400);
  const r = await p.evaluate(() => {
    const { MODS, weaponStats } = __weapons, L = __cards.LOADOUT, out = {};
    const press = (c) => { window.dispatchEvent(new KeyboardEvent('keydown', { code: c })); window.dispatchEvent(new KeyboardEvent('keyup', { code: c })); };
    __startPractice();
    for (const m of MODS) {
      L.pl.weapon = 'sword'; L.pl.weaponSpec = { id: 'sword', rarity: 'rare', base: 20, mods: [{ key: m.key }] }; L.bot.companion = null;
      __resetRound(); Object.assign(__bot, { x: 700 }); Object.assign(__fighter, { x: 610, facing: 1 });
      const d0 = __bot.damage;
      for (let i = 0; i < 60 * 4; i++) { if (i % 20 === 0) press('KeyJ'); Object.assign(__fighter, { x: Math.min(__fighter.x, __bot.x - 90) }); __tick(1 / 60); if (__bot.rag || __bot.dead > 0) { Object.assign(__bot, { x: 700, y: 540, vx: 0, vy: 0, rag: null, onGround: true, dead: 0 }); } }
      out[m.key] = +(__bot.damage - d0).toFixed(1);
    }
    // stacking / curse / bless
    const s1 = weaponStats({ id: 'sword', rarity: 'ancient', base: 35, mods: [{ key: 'keen' }, { key: 'keen' }, { key: 'lifesteal' }, { key: 'lifesteal' }, { key: 'long', blessed: true }, { key: 'heavy', curse: 'light' }] });
    return { dmg: out, stack: { keen: s1.keen, lifesteal: s1.lifesteal, long: s1.long, heavy: s1.heavy, light: s1.light } };
  });
  console.log('damage dealt in 4 s, per modifier:', JSON.stringify(r.dmg));
  console.log('stacking:', JSON.stringify(r.stack), '(expect keen 14, lifesteal 25, long 45, heavy 30, light -10)');
  // anchor and mirror and the DG ones: a Divine General round with each
  const dg = await p.evaluate(() => {
    const L = __cards.LOADOUT, press = (c) => { window.dispatchEvent(new KeyboardEvent('keydown', { code: c })); window.dispatchEvent(new KeyboardEvent('keyup', { code: c })); }, out = {};
    for (const k of ['splash', 'echo', 'bleed', 'phantom', 'thunderclap', 'inkpool', 'mirror', 'anchor', 'fate', 'lifesteal']) {
      L.pl.weapon = 'sword'; L.pl.weaponSpec = { id: 'sword', rarity: 'rare', base: 20, mods: [{ key: k }] }; L.bot.companion = 'divineGeneral';
      __resetRound(); let saved = 0;
      for (let i = 0; i < 60 * 12; i++) {
        const g = __dg(); if (!g) break;
        if (i % 18 === 0 && !__fighter.rag) { __fighter.x = g.x - g.facing * 150; press('KeyJ'); }
        if (i % 60 === 0) press('ShiftLeft');
        const wasAnchor = __fighter.anchorUsed; __tick(1 / 60); if (!wasAnchor && __fighter.anchorUsed) saved++;
        if (__fighter.out) break;
      }
      out[k] = { dgDmg: __dg() ? +__dg().damage.toFixed(1) : 'fell', anchorSaves: saved };
    }
    return out;
  });
  console.log('vs the Divine General (12 s):', JSON.stringify(dg));
  console.log('errors', errs); await b.close();
})();

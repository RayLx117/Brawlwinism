// The weapon forge (practice tool): opens Select Cards, opens the forge on the Sword, sets it up (Legendary, a few modifiers
// incl. a cursed and a stacked one), and screenshots the forge, the modifier picker and the cards screen. Then fights with it.
const { chromium } = require('playwright'); const path = require('path'), fs = require('fs');
const OUT = path.join(__dirname, 'out') + '/'; fs.mkdirSync(OUT, { recursive: true });
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1.5 }); const errs = []; p.on('pageerror', e => errs.push(e.stack));
  await p.goto('file://' + path.resolve(__dirname, '../index.html')); await p.waitForTimeout(500);
  const box = await p.locator('canvas').boundingBox();
  const key = (c) => p.evaluate((c) => { window.dispatchEvent(new KeyboardEvent('keydown', { code: c })); window.dispatchEvent(new KeyboardEvent('keyup', { code: c })); }, c);
  const w = (ms) => p.waitForTimeout(ms);
  await p.evaluate(() => __startPractice());
  await key('Escape'); await w(150); await key('ArrowDown'); await w(60); await key('ArrowDown'); await w(60); await key('Enter'); await w(250);   // Select Cards
  // focus the Sword in the gallery and select it
  await p.evaluate(() => { const c = __cardsState(); c.row = 3; c.col = __cards.CARDS.findIndex(x => x.id === 'sword'); });
  await key('Enter'); await w(250);
  console.log('screen', await p.evaluate(() => __menu.screen));
  // set it up through the forge's own actions: Legendary, then pick modifiers into the slots
  const click = async (id) => { const h = await p.evaluate((id) => __forge.hits.find(h => h.id === id), id); if (!h) { console.log('no item', id); return; } const s = box.width / 1280; await p.mouse.click(box.x + (h.x0 + h.x1) / 2 * s, box.y + (h.y0 + h.y1) / 2 * s); await w(120); };
  await click('r:legendary');
  for (const [slot, mod] of [[0, 'keen'], [1, 'keen'], [2, 'lifesteal'], [3, 'echo']]) { await click('m:' + slot); await w(100); if (slot === 0) await p.screenshot({ path: OUT + 'forge-picker.png', clip: box }); await click(mod); }
  await click('t:1'); await click('p:1');   // the second Keen: cursed, then switch which modifier the curse takes from
  await p.mouse.move(box.x + 5, box.y + 5); await w(200);
  await p.screenshot({ path: OUT + 'forge.png', clip: box });
  console.log('spec', JSON.stringify(await p.evaluate(() => __cards.LOADOUT.pl.weaponSpec)), 'stats', JSON.stringify(await p.evaluate(() => __weapons.weaponStats(__cards.LOADOUT.pl.weaponSpec))));
  await click('done'); await w(200);
  await p.screenshot({ path: OUT + 'forge-cards.png', clip: box });
  // back to the fight (a changed loadout starts a fresh round), then swing at the bot
  await key('Escape'); await w(300);
  const r = await p.evaluate(() => {
    Object.assign(__bot, { x: 700, damage: 0 }); Object.assign(__fighter, { x: 600, facing: 1, damage: 40 });
    __step(1 / 60, 30);
    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyJ' })); window.dispatchEvent(new KeyboardEvent('keyup', { code: 'KeyJ' }));
    __step(1 / 60, 20);   // (with a sword, J is the rising slash: a longer wind-up, slower still when cursed)
    window.__jab = { botDmg: __bot.damage, plDmg: +__fighter.damage.toFixed(2), wpn: __fighter.wpn && __fighter.wpn.dmg };
    __step(1 / 60, 1);
    return window.__jab;
  });
  await p.screenshot({ path: OUT + 'sword-jab.png', clip: { x: box.x + box.width * 0.35, y: box.y + box.height * 0.45, width: box.width * 0.3, height: box.height * 0.35 } });
  console.log('after one jab', JSON.stringify(r), 'errors', errs); await b.close();
})();

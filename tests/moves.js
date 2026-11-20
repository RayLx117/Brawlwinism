const { chromium } = require('playwright');
const path = require('path'), fs = require('fs'); const GAME = 'file://' + path.resolve(__dirname, '../index.html'); const OUT = path.join(__dirname, 'out') + '/'; fs.mkdirSync(OUT, { recursive: true });
(async () => { const b = await chromium.launch(); const p = await b.newPage(); const errs=[]; p.on('pageerror', e => errs.push(e.stack)); await p.goto(GAME);
await p.evaluate(() => {
  const k = (c, d) => window.dispatchEvent(new KeyboardEvent(d ? 'keydown' : 'keyup', { code: c }));
  window.K = k;
  window.reset = (px=790, air=null) => { const f=__fighter, bo=__bot; __step(1/60,1);
    Object.assign(bo,{x:860,y:540,vx:0,vy:0,rag:null,onGround:true,stunT:0,hurtT:0,damage:window.DMG||0,dead:0,combo:0,label:'',move:'',moveT:0,parryT:0});
    Object.assign(f,{x:px,y:air??540,vx:0,vy:0,onGround:air==null,facing:1,dashT:0,slideT:0,crouchK:0,staggerT:0,lockT:0,landT:0,airJumps:1,airDashes:1,airDashCd:0,fastFall:false});
    f.punch.on=false; f.punch.next=0; f.punch.lastEnd=-9; for (const c of ['KeyA','KeyD','KeyS','KeyW','KeyJ','ShiftLeft']) k(c,0); __step(1/60,1); };
  window.watch = (n) => { let res=null; const bo=__bot; for (let i=0;i<n;i++){ __step(1/60,1); if (!res && (bo.moveT>1.3)) res={f:i, move:bo.move, vx:bo.vx|0, vy:bo.vy|0, rag:!!bo.rag, label:bo.label, dmg:bo.damage}; } return res; };
});
const tests = {
  'jab>cross>uppercut': () => { reset(); const ev=[]; let lm=''; for (let i=0;i<70;i++){ K('KeyJ', i%8===0); __step(1/60,1); if (__bot.moveT>1.3 && __bot.move!==lm){ ev.push(i+':'+__bot.move+' '+__bot.label+' rag'+!!__bot.rag); lm=__bot.move;} } K('KeyJ',0); return ev.join(' | '); },
  'jab>cross>sucker (hold →)': () => { reset(); const ev=[]; let lm=''; for (let i=0;i<70;i++){ K('KeyJ', i%8===0); if(i===14) K('KeyD',1); __step(1/60,1); if (__bot.moveT>1.3 && __bot.move!==lm){ ev.push(i+':'+__bot.move+' '+__bot.label+' v'+(__bot.vx|0)+','+(__bot.vy|0)); lm=__bot.move;} } K('KeyJ',0); K('KeyD',0); return ev.join(' | '); },
  'jab>cross>roundhouse (hold ↓)': () => { reset(); const ev=[]; let lm=''; for (let i=0;i<70;i++){ K('KeyJ', i%8===0); if(i===14) K('KeyS',1); __step(1/60,1); if (__bot.moveT>1.3 && __bot.move!==lm){ ev.push(i+':'+__bot.move+' '+__bot.label+' v'+(__bot.vx|0)+','+(__bot.vy|0)); lm=__bot.move;} } K('KeyJ',0); K('KeyS',0); return ev.join(' | '); },
  'dash punch': () => { reset(640); K('KeyD',1); K('ShiftLeft',1); __step(1/60,1); K('ShiftLeft',0); __step(1/60,3); K('KeyJ',1); __step(1/60,1); K('KeyJ',0); K('KeyD',0); return JSON.stringify(watch(40)); },
  'low kick': () => { reset(805); K('KeyS',1); __step(1/60,12); K('KeyJ',1); __step(1/60,1); K('KeyJ',0); const r=watch(30); K('KeyS',0); return JSON.stringify(r); },
  'slide kick': () => { reset(560); K('KeyD',1); __step(1/60,30); K('KeyS',1); __step(1/60,2); K('KeyJ',1); __step(1/60,1); K('KeyJ',0); const r=watch(40); K('KeyD',0); K('KeyS',0); return JSON.stringify(r); },
  'nair': () => { reset(815, 470); K('KeyJ',1); __step(1/60,1); K('KeyJ',0); return JSON.stringify(watch(30)); },
  'fair': () => { reset(790, 470); K('KeyD',1); K('KeyJ',1); __step(1/60,1); K('KeyJ',0); K('KeyD',0); return JSON.stringify(watch(30)); },
  'uair': () => { reset(840, 440); K('KeyW',1); K('KeyJ',1); __step(1/60,1); K('KeyJ',0); K('KeyW',0); return JSON.stringify(watch(30)); },
  'dair': () => { reset(850, 400); K('KeyS',1); K('KeyJ',1); __step(1/60,1); K('KeyJ',0); const r=watch(40); K('KeyS',0); return JSON.stringify(r); },
};
for (const [n, fn] of Object.entries(tests)) console.log(n.padEnd(30), await p.evaluate(`(${fn.toString()})()`));
console.log('errors', errs); await b.close(); })();

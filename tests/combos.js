const { chromium } = require('playwright');
const path = require('path'), fs = require('fs'); const GAME = 'file://' + path.resolve(__dirname, '../index.html'); const OUT = path.join(__dirname, 'out') + '/'; fs.mkdirSync(OUT, { recursive: true });
(async () => { const b = await chromium.launch(); const p = await b.newPage(); const errs=[]; p.on('pageerror', e => errs.push(e.stack)); await p.goto(GAME);
await p.evaluate(() => {
  const k = (c, d) => window.dispatchEvent(new KeyboardEvent(d ? 'keydown' : 'keyup', { code: c }));
  window.K = k;
  window.reset = (px=790, air=null, dmg=0) => { const f=__fighter, bo=__bot; __step(1/60,1);
    Object.assign(bo,{x:860,y:540,vx:0,vy:0,rag:null,onGround:true,stunT:0,hurtT:0,damage:dmg,dead:0,combo:0,label:'',moveLab:'',moveLabT:0,parryT:0});
    Object.assign(f,{x:px,y:air??540,vx:0,vy:0,onGround:air==null,facing:1,dashT:0,slideT:0,crouchK:0,staggerT:0,lockT:0,landT:0,airJumps:1,airDashes:1,airDashCd:0,fastFall:false});
    f.punch.on=false; f.punch.next=0; f.punch.lastEnd=-9; for (const c of ['KeyA','KeyD','KeyS','KeyW','KeyJ','ShiftLeft','Space']) k(c,0); __step(1/60,1); };
  // script: list of [frame, key, down]; runs N frames, logs hits
  window.run = (script, N) => { const ev=[]; let last=0; const bo=__bot;
    for (let i=0;i<N;i++){ for (const [f,c,d] of script) if (f===i) K(c,d); __step(1/60,1);
      if (bo.moveLabT>1.38 && bo.moveLabT !== last) { ev.push(i+':'+bo.moveLab+(bo.label?' ['+bo.label+']':'')+(bo.rag?' RAG':'')+' bot y'+(bo.y|0)); } last = bo.moveLabT; }
    return ev.join(' | ') + '  || pl y'+(__fighter.y|0)+' x'+(__fighter.x|0)+' bot x'+(__bot.x|0); };
});
const T = {
  'dair on grounded bot': `reset(855, 330); run([[0,'KeyS',1],[0,'KeyJ',1],[1,'KeyJ',0],[30,'KeyS',0]], 60)`,
  'slide kick > jump > flip kick': `reset(600); run([[0,'KeyD',1],[40,'KeyS',1],[44,'KeyJ',1],[45,'KeyJ',0],[50,'KeyD',0],[56,'KeyS',0],[JF,'Space',1],[JF+4,'Space',0],[UF,'KeyJ',1],[UF,'KeyW',1],[UF+1,'KeyJ',0],[UF+1,'KeyW',0]], 120)`,
  'dash punch > cross > sucker': `reset(650); run([[0,'KeyD',1],[0,'ShiftLeft',1],[1,'ShiftLeft',0],[4,'KeyD',0],[4,'KeyJ',1],[5,'KeyJ',0],[14,'KeyJ',1],[15,'KeyJ',0],[28,'KeyD',1],[30,'KeyJ',1],[31,'KeyJ',0]], 90)`,
  'low kick > cross > roundhouse': `reset(800); run([[0,'KeyS',1],[12,'KeyJ',1],[13,'KeyJ',0],[20,'KeyS',0],[22,'KeyJ',1],[23,'KeyJ',0],[30,'KeyS',1],[34,'KeyJ',1],[35,'KeyJ',0]], 100)`,
  'jump knee > flying kick': `reset(770); run([[0,'Space',1],[16,'Space',0],[3,'KeyJ',1],[4,'KeyJ',0],[24,'KeyD',1],[24,'KeyJ',1],[25,'KeyJ',0],[30,'KeyD',0]], 90)`,
};
for (const [n, c] of Object.entries(T)) { if (c.includes('JF')) { for (const [jf,uf] of [[62,64],[62,66],[62,68],[62,70],[63,72],[64,74]]) console.log(n.padEnd(32), jf, uf, await p.evaluate(c.replaceAll('JF',jf).replaceAll('UF',uf))); } else console.log(n.padEnd(32), await p.evaluate(c)); }
console.log('errors', errs); await b.close(); })();

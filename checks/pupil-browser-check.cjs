// Optional browser integration check: start the static server first.
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const {existsSync}=require('node:fs');
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||(existsSync('/usr/bin/chromium')?'/usr/bin/chromium':undefined),headless:true,args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 try {
 const page=await browser.newPage({viewport:{width:960,height:640}});const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')console.log('BROWSER',m.text())});
 page.setDefaultTimeout(120000);await page.goto((process.env.PUPIL_TEST_URL||'http://127.0.0.1:8000/campus-view.html'),{waitUntil:'domcontentloaded',timeout:120000});await page.waitForFunction(()=>window.campusPupil?.ready||window.campusPupil?.failed,{timeout:60000});
 assert(await page.evaluate(()=>campusPupil.ready&&!campusPupil.failed),'GLB loads successfully');
 await page.waitForFunction(()=>campusPupil.pupils.every(p=>p.ready||p.failed));
 assert(await page.evaluate(()=>campusPupil.pupils.length===2&&campusPupil.pupils.every(p=>p.ready&&!p.failed)),'Both independent GLB pupils load');
 assert(await page.evaluate(()=>campusPupil.root.parent===campusDebug.scene),'Pupil is an independent scene actor');
 const start=await page.evaluate(()=>({x:campusPupil.actor.x,y:campusPupil.actor.y}));
 await page.waitForFunction(p=>Math.hypot(campusPupil.actor.x-p.x,campusPupil.actor.y-p.y)>2,start,{timeout:30000});
 console.log('PASS: pupil roams automatically before receiving any command');
 await page.locator('#look').click();await page.waitForFunction(()=>!!document.pointerLockElement,null,{timeout:10000});
 await page.keyboard.press('h');
 assert(await page.locator('#pupilPanel').isVisible(),'H opens the menu');
 console.log('BEHAVIOR',await page.evaluate(()=>{
 const C=campusPupil,D=campusDebug,P=D.plan,results=[],playerPosition=D.camera.position.clone();
 function step(n){for(let i=0;i<n;i++){for(const d of D.doors)for(const leaf of d.leaves)leaf.hinge.rotation.y+=((d.open?leaf.target:0)-leaf.hinge.rotation.y)*.28;C.tick(.04);}}
 function check(ok,label){if(!ok)throw new Error(label);results.push(label);}
 C.command('fr');step(2200);const r=P.floors[0].rooms.find(r=>r.id==='fr');check(!C.actor.path.length&&P.containsRoom(r,C.actor.x,C.actor.y),'French classroom reached through real doors');
 C.command('gate');step(1400);check(!C.actor.path.length&&Math.hypot(C.actor.x-1350,C.actor.y-225)<12,'Gate reached running');
 C.command('home');step(900);check(!C.actor.path.length&&Math.hypot(C.actor.x-1100,C.actor.y-220)<12,'Return home');
 check(D.camera.position.distanceToSquared(playerPosition)<1e-8,'Remote orders never move the first-person player');
 C.focusActor();check(D.camera.position.distanceToSquared(playerPosition)<1e-8,'Look-at command never teleports the player');
 C.command('roam');const old=C.actor.x;step(120);check(Math.abs(old-C.actor.x)>5,'Free roaming moves');
 document.querySelector('[data-pupil="pause"]').click();const frozen={x:C.actor.x,y:C.actor.y,phase:C.actor.phase};step(80);check(C.actor.x===frozen.x&&C.actor.y===frozen.y&&C.actor.phase===frozen.phase,'Pause freezes movement and gait');
 C.command('stop');step(80);const x=C.actor.x,y=C.actor.y;step(80);check(C.actor.x===x&&C.actor.y===y,'Stop cancels route');
 D.teleport(1200,220,0);C.command('follow');step(500);check(Math.hypot((C.actor.x-1200)*P.scale,(C.actor.y-220)*P.scale)<2,'Follow player');
 const size=new THREE.Box3().setFromObject(C.root.children[0]).getSize(new THREE.Vector3());check(Math.abs(size.y-1.62)<.02,'Rigged pupil height is 1.62 metres');
 check(C.animations.length===9,'Eight native clips plus rest pose loaded');
 C.command('stop');const location={x:C.actor.x,y:C.actor.y};
 for(const clip of ['dance_01','laugh_01','flip','run_upstairs','press-up','sit']){C.command('clip:'+clip);step(40);check(C.animation===clip&&C.actor.x===location.x&&C.actor.y===location.y,'Native animation on spot: '+clip);}
 const bones=[];C.root.traverse(o=>{if(o.isBone)bones.push(o)});
 const before=bones.map(b=>b.quaternion.toArray().join(','));step(10);check(bones.some((b,i)=>b.quaternion.toArray().join(',')!==before[i]),'Native skeleton animates');
 document.querySelector('[data-pupil="pause"]').click();const pausePose=bones.map(b=>b.quaternion.toArray().join(','));step(20);check(bones.every((b,i)=>b.quaternion.toArray().join(',')===pausePose[i]),'Pause freezes native skeleton');
 const first=C.pupils[0],firstPosition={x:first.actor.x,y:first.actor.y};
 check(C.selectPupil('eleve-2')&&C.actor===C.pupils[1].actor,'Select second pupil');
 C.command('fr');step(2200);check(!C.actor.path.length&&P.containsRoom(r,C.actor.x,C.actor.y),'Second pupil reaches French classroom');
 C.command('gate');step(1400);check(!C.actor.path.length&&Math.hypot(C.actor.x-1350,C.actor.y-225)<12,'Second pupil runs to gate');
 C.command('home');step(900);check(!C.actor.path.length&&Math.hypot(C.actor.x-1100,C.actor.y-190)<12,'Second pupil returns to its own home');
 check(first.paused&&first.actor.x===firstPosition.x&&first.actor.y===firstPosition.y,'Commands for second pupil preserve first pupil state');
 C.pupils[1].setSpeed(2);check(first.speedMultiplier===1&&C.pupils[1].speedMultiplier===2,'Each pupil has independent speed');
 for(const clip of ['dance_01','laugh_01','flip','run_upstairs','press-up','sit']){C.command('clip:'+clip);step(40);check(C.animation===clip,'Second pupil native clip: '+clip);}
 C.selectPupil('eleve-1');check(document.querySelector('#pupilSpeed').value==='1'&&document.querySelector('[data-pupil="pause"]').getAttribute('aria-pressed')==='true','Menu restores selected pupil speed and pause');
 return results;
}));
 await page.selectOption('#pupilSelect','eleve-2');assert(await page.evaluate(()=>campusPupil.actor===campusPupil.pupils[1].actor),'Dropdown selects second pupil');
 await page.keyboard.press('h');assert(!(await page.locator('#pupilPanel').isVisible()),'H closes the menu');
 await page.keyboard.press('h');assert(await page.locator('#pupilPanel').isVisible(),'H reopens the menu');
 assert.deepEqual(errors,[],'No uncaught browser errors');
 } finally { await browser.close(); }
})().catch(e=>{console.error(e);process.exitCode=1});

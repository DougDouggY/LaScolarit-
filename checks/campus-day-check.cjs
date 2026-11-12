require('./campus-check.cjs');
const fs=require('fs'),vm=require('vm'),assert=require('assert');
vm.runInThisContext(fs.readFileSync('dist/campus-students.js','utf8'));vm.runInThisContext(fs.readFileSync('dist/campus-day.js','utf8'));
const DD=campusDebug,day=startCampusDay(DD),plan=DD.plan;
assert.equal(day.actors.length,22);assert.equal(day.actors.filter(a=>a.role==='student').length,10);
assert(!DD.gateOpen());assert(!DD.canMove((1380-715)*plan.scale,(225-360)*plan.scale,0));
assert(day.actors.every(a=>Number.isFinite(a.x)&&Number.isFinite(a.y)&&!a.routeFailed),'All initial actors placed on reachable floor');
day.setTime(465);assert(DD.gateOpen());day.setPaused(false);
function run(seconds){for(let n=0;n<seconds*25;n++)day.tick(.04);}
run(18);assert(day.actors.filter(a=>a.role==='student').every(a=>a.x<1380),'Every student walks through opened gate into courtyard');
day.setTime(475);assert(!DD.gateOpen());run(12);assert(day.actors.find(a=>a.id==='jef').x<1300,'Jef leaves gate after closing');
for(const time of [480,590,605,610,720,750,780,840,890,905,910,960,1020]){day.setTime(time);assert(day.actors.every(a=>!a.routeFailed),'Routes exist for all actors at '+time);run(time===750?130:([605,905].includes(time)?25:120));console.log(time,day.actors.filter(a=>a.role==='student').map(a=>a.state+':'+Math.round(a.x)+','+Math.round(a.y)+','+a.h.toFixed(1)+':'+a.path.length).join(' | '));if([480,610,840,910,960].includes(time)){const p=day.phase,r=plan.floors.flatMap(f=>f.rooms).find(r=>r.id===p.room);assert(day.actors.filter(a=>a.role==='student').every(a=>a.seated&&plan.containsRoom(r,a.x,a.y)),'All pupils reach classroom chairs at '+time);assert(day.actors.filter(a=>a.role==='student').every(a=>Math.abs(a.h-(time===840||time===910?plan.storey:0))<.01),'Students use stairs to correct floor');}}
day.setTime(464.99);day.setPaused(false);run(1);assert.equal(day.events.filter(e=>e.id==='entry').length,1,'Event fired once when crossing boundary');const minute=day.minutes,actor=day.actors[0],x=actor.x;day.setPaused(true);run(1);assert.equal(day.minutes,minute);assert.equal(actor.x,x,'Paused NPC remains still');
assert(day.actors.filter(a=>a.role!=='student').every(a=>a.g.userData.model==='cartoon-adult-v1'&&a.g.scale.y>=.98),'All adults use the larger cartoon model');
for(const speed of [1,2,3]){day.setTime(450);day.setSpeed(speed);day.setPaused(false);run(2);assert(Math.abs(day.minutes-(450+.3*speed))<1e-7,'Clock respects '+speed+'x');}
day.setPaused(true);const frozen=day.actors.map(a=>({x:a.x,y:a.y,h:a.g.rotation.y,pose:a.limbs[0].leg.rotation.x})),clock=day.minutes;run(2);assert.equal(day.minutes,clock);assert.deepEqual(day.actors.map(a=>({x:a.x,y:a.y,h:a.g.rotation.y,pose:a.limbs[0].leg.rotation.x})),frozen,'Speed control retains fully paused actors');
day.setSpeed(1);day.setTime(480);const targets=day.actors.filter(a=>a.role==='student').map(a=>a.target.seat);assert.equal(new Set(targets.map(t=>t.x+':'+t.y)).size,10,'Every pupil has a different chair');assert(new Set(targets.map(t=>Math.round(t.x))).size>3,'Seating is spread across the classroom depth');
console.log('PASS: cartoon adults, dispersed unique seats, x1/x2/x3 clock and animation pause.');
console.log('PASS: daily schedule, gate, all actor routes, classroom seating, stairs, lunch, one-time events and pause.');

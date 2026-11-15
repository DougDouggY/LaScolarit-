'use strict';
// Rigged pupil: native GLB clips, with navigation controlling horizontal root motion.
window.startCampusPupil=function(D){
 const panel=document.querySelector('#pupilPanel'),status=document.querySelector('#pupilStatus'),badge=document.querySelector('#pupilBadge'),selector=document.querySelector('#pupilSelect');
 const buttons=[...panel.querySelectorAll('[data-pupil]')],pupils=[],navigation=makeCampusNavigator(D),destinations=new Map(),gestures=new Map();
 let selectedIndex=0,lastFocus=null;
 function selected(){return pupils[selectedIndex];}
 function refresh(){
  const c=selected();if(!c)return;
  buttons.forEach(b=>{b.disabled=!c.ready||(b.dataset.pupil.startsWith('clip:')&&!c.animations.includes(b.dataset.pupil.slice(5)));});
  status.textContent=c.name+' · '+c.message;badge.textContent=c.name+' · '+c.message;
  document.querySelector('#pupilSpeed').disabled=!c.ready;
  document.querySelector('#pupilSpeed').value=c.speedMultiplier;
  document.querySelector('#pupilSpeedValue').textContent=c.speedMultiplier+'×';
  document.querySelector('[data-pupil="pause"]').setAttribute('aria-pressed',String(c.paused));
 }
 function open(value){panel.hidden=!value;document.querySelector('#pupilButton').setAttribute('aria-expanded',String(value));if(value){document.exitPointerLock?.();lastFocus=document.activeElement;document.querySelector('#pupilClose').focus();}else lastFocus?.focus?.();}
 function selectPupil(id){const i=pupils.findIndex(c=>c.id===id);if(i<0)return false;selectedIndex=i;selector.value=id;refresh();return true;}
 function createPupil(config){
 const T=THREE,P=D.plan,X=x=>(x-715)*P.scale,Z=y=>(y-360)*P.scale;
 const nav=navigation,home=config.home;
 const actor={x:home.x,y:home.y,h:0,path:[],heading:0,phase:0,blend:0,speed:1.25};
 let model=null,mixer=null,currentAction=null,currentClip='',actions={},naturalSpeeds={},mode='stop',paused=false,followTimer=0,roamWait=0,ready=false,failed=false,speedMultiplier=1,message='Chargement…',roamStage='wait',autonomyClip=null,blockedTime=0;
 let randomState=config.seed;
 function random(){randomState=(Math.imul(randomState,1664525)+1013904223)>>>0;return randomState/4294967296;}
 function releaseReservations(){for(const map of [destinations,gestures])for(const [key,id]of map)if(id===config.id)map.delete(key);}
 const initialView={position:D.camera.position.clone(),quaternion:D.camera.quaternion.clone()};
 const root=new T.Group();root.name=config.name+' · GLB';D.scene.add(root);
 function say(text){if(message!==text){message=text;if(selected()?.id===config.id)refresh();}}
 function roomTarget(id){const r=P.floors[0].rooms.find(r=>r.id===id),door=P.doorOf(r);
  // Stay on the central aisle just inside the room, clear of desks.
  return {x:door.axis==='z'?r.x+r.w-36:(door.a+door.b)/2,y:door.axis==='z'?(door.a+door.b)/2:r.y+36,level:0};
 }
 function route(target,label){
  if(Math.abs(actor.h)>0.1||target.level!==0){say('Rejoins le rez-de-chaussée pour ce test.');return false;}
  const path=nav.makeRoute(actor,target);
  if(!path.length){actor.path=[];mode='stop';say('Trajet inaccessible : choisis une autre action.');return false;}
  actor.path=path;actor.target=target;say(label);return true;
 }
 const roamPoints=[{x:1100,y:200,level:0},{x:1250,y:280,level:0},{x:750,y:220,level:0},{x:950,y:330,level:0},{x:600,y:150,level:0},{x:850,y:120,level:0},{x:1050,y:100,level:0},{x:1230,y:140,level:0},{x:720,y:300,level:0},{x:1000,y:260,level:0}];
 function command(action){
  if(!ready)return false;paused=false;releaseReservations();autonomyClip=null;
  mode=action;actor.path=[];actor.speed=action==='gate'?config.runSpeed:config.walkSpeed;
  if(action.startsWith('clip:')){const name=action.slice(5);mode=action;play(name);say('Animation sur place · '+clipLabels[name]);return true;}
  if(action==='fr')return route(roomTarget('fr'),'Marche vers la salle de français');
  if(action==='gate')return route({x:1350,y:225,level:0},'Court vers le portail');
  if(action==='home')return route(home,'Retour au point de départ');
  if(action==='roam'){roamStage='wait';roamWait=config.startDelay;say('Déplacement libre dans la cour');return true;}
  if(action==='follow'){followTimer=0;say('Te suit en marchant · reste au RDC');return true;}
  mode='stop';say('À l’arrêt');return true;
 }
 function focusActor(){
  // Remote control never moves or replaces the first-person player.
  D.facePoint(X(actor.x),actor.h+1.40,Z(actor.y));return true;
 }
 const clipLabels={dance_01:'Danser',laugh_01:'Rire',flip:'Salto',run_upstairs:'Monter des marches',"press-up":'Faire des pompes',sit:'S’asseoir',walk:'Marcher',run:'Courir'};
 function play(name){
  if(!actions[name]||name===currentClip)return;
  const next=actions[name];next.reset().setEffectiveTimeScale(1).setEffectiveWeight(1);
  if(name==='walk'||name==='run')next.time=next.getClip().duration*config.gaitOffset;
  next.play();
  if(currentAction){currentAction.fadeOut(.2);next.fadeIn(.2);}
  currentAction=next;currentClip=name;
 }
 new T.GLTFLoader().load(config.url,gltf=>{
  model=gltf.scene;
  // Skinned bounds require initialized bone world matrices; otherwise the
  // first pre-render box can be much smaller than the actual character.
  model.updateMatrixWorld(true);
  model.traverse(o=>{if(o.isSkinnedMesh){o.skeleton.update();o.computeBoundingBox();}});
  const box=new T.Box3().setFromObject(model),size=box.getSize(new T.Vector3()),center=box.getCenter(new T.Vector3());
  if(!Number.isFinite(size.y)||size.y<=0){failed=true;say('Modèle invalide : hauteur introuvable.');return;}
  const scale=1.62/size.y;model.scale.setScalar(scale);model.position.set(-center.x*scale,-box.min.y*scale,-center.z*scale);
  const restTracks=[];let hip=null;
  model.traverse(o=>{
   if(o.isMesh){o.castShadow=true;o.frustumCulled=false;}
   if(o.isBone){
    if(o.name.toLowerCase().includes('hips'))hip=o;
    for(const [key,Type]of [['position',T.VectorKeyframeTrack],['quaternion',T.QuaternionKeyframeTrack],['scale',T.VectorKeyframeTrack]]){
     const values=o[key].toArray();restTracks.push(new Type(o.name+'.'+key,[0,1],values.concat(values)));
    }
   }
  });
  mixer=new T.AnimationMixer(model);
  actions.idle=mixer.clipAction(new T.AnimationClip('idle',1,restTracks));
  for(const original of gltf.animations){
   const clip=original.clone();
   for(const track of clip.tracks){
    if(hip&&track.name===hip.name+'.position'){
     const values=track.values,n=values.length,firstY=values[1],rise=values[n-2]-firstY,lastTime=track.times[track.times.length-1]||1;
     naturalSpeeds[clip.name]=Math.hypot(values[n-3]-values[0],values[n-1]-values[2])*scale/clip.duration;
     for(let i=0;i<values.length;i+=3){values[i]=hip.position.x;values[i+2]=hip.position.z;
      if(clip.name==='run_upstairs')values[i+1]-=rise*track.times[i/3]/lastTime;
     }
    }
   }
   actions[clip.name]=mixer.clipAction(clip);
  }
  root.add(model);play('idle');mixer.update(0);
  const canvas=document.createElement('canvas');canvas.width=512;canvas.height=96;
  const ctx=canvas.getContext('2d');ctx.fillStyle='#152329';ctx.fillRect(0,0,512,96);ctx.fillStyle='#f1e7ca';ctx.font='bold 32px system-ui';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(config.name.toUpperCase()+' · H',256,48);
  const label=new T.Sprite(new T.SpriteMaterial({map:new T.CanvasTexture(canvas),depthWrite:false}));label.position.y=1.94;label.scale.set(1.05,.20,1);label.name='Repère élève';root.add(label);
  ready=true;command('roam');
  if(config.frameInitially&&D.camera.position.distanceToSquared(initialView.position)<.001&&Math.abs(D.camera.quaternion.dot(initialView.quaternion))>.9999)D.facePoint(X(actor.x),actor.h+1.40,Z(actor.y));
 },undefined,error=>{failed=true;console.error('Chargement du personnage GLB',error);say('Échec du chargement. Recharge la page pour réessayer.');});
 function tick(dt){
  if(!ready)return;dt=Math.min(dt,.04);let traveled=0;
  if(!paused){
   if(mode==='follow'){
    followTimer-=dt;const p=D.position(),distance=Math.hypot(X(p.x)-X(actor.x),Z(p.y)-Z(actor.y));
    if(p.level||p.stair){actor.path=[];say('Je t’attends au rez-de-chaussée.');}
    else if(distance<1.8)actor.path=[];
    else if(followTimer<=0){followTimer=.9;route({x:p.x,y:p.y,level:0},'Te suit en marchant');}
   }
   if(mode==='roam'&&!actor.path.length){
    roamWait-=dt;
    if(roamWait<=0){
     if(roamStage==='travel'){
      // Each pupil alternates independent trips and breaks. Gestures are not
      // shared in time, and the next destination stays reserved during a break.
      const choices=config.gestures.filter(name=>name==='idle'||(!gestures.has(name)&&actions[name]));
      autonomyClip=choices[Math.floor(random()*choices.length)]||'idle';
      if(autonomyClip!=='idle')gestures.set(autonomyClip,config.id);
      roamStage='break';roamWait=config.restMin+random()*config.restRange;
      say(autonomyClip==='laugh_01'?'Rit un moment dans la cour':autonomyClip==='dance_01'?'Fait quelques pas de danse':'Fait une pause et observe la cour');
     }else{
      releaseReservations();autonomyClip=null;
      const choices=roamPoints.filter(p=>Math.hypot(p.x-actor.x,p.y-actor.y)>60&&!destinations.has(p.x+':'+p.y));
      if(choices.length){const point=choices[Math.floor(random()*choices.length)];destinations.set(point.x+':'+point.y,config.id);roamStage='travel';route(point,'Se promène à son rythme dans la cour');}
      else roamWait=1+random()*2;
     }
    }
   }
   const target=actor.path[0];
   if(target){
    const dx=X(target.x)-X(actor.x),dz=Z(target.y)-Z(actor.y),len=Math.hypot(dx,dz),step=Math.min(len,dt*actor.speed*speedMultiplier);
    if(len<.025){actor.path.shift();if(!actor.path.length&&!['roam','follow'].includes(mode)){say('Arrivé · '+(mode==='fr'?'salle de français':mode==='gate'?'portail':'point de départ'));mode='stop';}}
    else{
     const nx=X(actor.x)+dx/len*step,nz=Z(actor.y)+dz/len*step;
     for(const door of D.doors)if(Math.abs(door.base-actor.h)<.4&&Math.hypot(nx-door.x,nz-door.z)<1.7)door.open=true;
     // Wait for real door leaves to open instead of walking through them.
     if(D.canMove(nx,nz,actor.h)){
      actor.x+=dx/len*step/P.scale;actor.y+=dz/len*step/P.scale;actor.heading=Math.atan2(dx,dz);traveled=step;blockedTime=0;
     }else{blockedTime+=dt;if(blockedTime>.7){blockedTime=0;actor.path=nav.makeRoute(actor,actor.target);if(!actor.path.length){mode='stop';releaseReservations();say('Passage bloqué : choisis une autre destination.');}}}
    }
   }
   actor.phase+=traveled*8;actor.blend+=((traveled>0?1:0)-actor.blend)*(1-Math.exp(-dt*10));
   root.rotation.y+=Math.atan2(Math.sin(actor.heading-root.rotation.y),Math.cos(actor.heading-root.rotation.y))*(1-Math.exp(-dt*9));
   const demo=mode.startsWith('clip:')?mode.slice(5):mode==='roam'?autonomyClip:null;
   const clip=demo||(traveled>0?(actor.speed>2?'run':'walk'):'idle');play(clip);
   const rate=speedMultiplier;
   if(currentAction)currentAction.setEffectiveTimeScale(demo?rate:clip==='idle'?1:actor.speed*rate/Math.max(.1,naturalSpeeds[clip]||actor.speed));
   mixer.update(dt);
  }
  root.position.set(X(actor.x),actor.h,Z(actor.y));
 }
 return{id:config.id,name:config.name,tick,command,focusActor,actor,root,roomTarget,
  handle(action){
   if(!ready)return false;
   if(action==='focus'){focusActor();open(false);return true;}
   if(action==='pause'){paused=!paused;say(paused?'Animation et déplacement en pause':'Reprise du test');refresh();return true;}
   if(action==='reset'){Object.assign(actor,{...home,h:0,path:[],phase:0,blend:0,heading:0});return command('roam');}
   return command(action);
  },
  setSpeed(value){speedMultiplier=Math.max(.25,Math.min(2,Number(value)||1));refresh();},
  get autonomous(){return mode==='roam'},get autonomy(){return {stage:roamStage,clip:autonomyClip,nextIn:roamWait}},
  get speedMultiplier(){return speedMultiplier},get message(){return message},
  get animation(){return currentClip},get animations(){return Object.keys(actions)},get ready(){return ready},get failed(){return failed},get paused(){return paused}};
 }
 // Future pupils also need unique seeds, paces, gait offsets and break profiles.
 for(const config of [
  {id:'eleve-1',name:'Élève 1',url:'assets/characters/eleve.glb?v=2',home:{x:1100,y:220,level:0},frameInitially:true,seed:173,walkSpeed:1.16,runSpeed:2.9,startDelay:.4,gaitOffset:.12,restMin:2,restRange:4,gestures:['idle','idle','laugh_01']},
  {id:'eleve-2',name:'Élève 2',url:'assets/characters/eleve-2.glb',home:{x:1100,y:190,level:0},seed:947,walkSpeed:1.34,runSpeed:3.2,startDelay:1.6,gaitOffset:.48,restMin:4,restRange:5,gestures:['idle','dance_01']},
  {id:'eleve-3',name:'Élève 3',url:'assets/characters/eleve-3.glb',home:{x:1100,y:250,level:0},seed:2131,walkSpeed:1.04,runSpeed:2.7,startDelay:2.8,gaitOffset:.79,restMin:3,restRange:8,gestures:['idle','idle','laugh_01','dance_01']}
 ]){
  const option=document.createElement('option');option.value=config.id;option.textContent=config.name;selector.appendChild(option);
  pupils.push(createPupil(config));
 }
 selector.onchange=()=>selectPupil(selector.value);
 document.querySelector('#pupilButton').onclick=()=>open(panel.hidden);
 document.querySelector('#pupilClose').onclick=()=>open(false);
 buttons.forEach(b=>b.onclick=()=>selected().handle(b.dataset.pupil));
 document.querySelector('#pupilSpeed').oninput=e=>selected().setSpeed(e.target.value);
 document.addEventListener('keydown',e=>{
  if(e.key.toLowerCase()==='h'&&!e.repeat&&!/INPUT|TEXTAREA/.test(e.target.tagName)){e.preventDefault();e.stopImmediatePropagation();open(panel.hidden);}
  else if(!panel.hidden&&e.key==='Escape'){e.preventDefault();e.stopImmediatePropagation();open(false);}
  else if(!panel.hidden&&e.key==='Tab'){
   const focus=[...panel.querySelectorAll('button,input,select')].filter(b=>!b.disabled),i=focus.indexOf(document.activeElement);
   if(e.shiftKey&&i<=0){e.preventDefault();focus.at(-1).focus();}else if(!e.shiftKey&&i===focus.length-1){e.preventDefault();focus[0].focus();}
  }
 },true);
 refresh();
 return{pupils,selectPupil,tick(dt){for(const pupil of pupils)pupil.tick(dt)},
  command(action){return selected().command(action)},focusActor(){return selected().focusActor()},roomTarget(id){return selected().roomTarget(id)},
  get actor(){return selected().actor},get root(){return selected().root},get animation(){return selected().animation},get animations(){return selected().animations},
  get ready(){return selected().ready},get failed(){return selected().failed},get menuOpen(){return !panel.hidden},get paused(){return selected().paused}};
};

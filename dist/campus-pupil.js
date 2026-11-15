'use strict';
// Rigged pupil: native GLB clips, with navigation controlling horizontal root motion.
window.startCampusPupil=function(D){
 const T=THREE,P=D.plan,X=x=>(x-715)*P.scale,Z=y=>(y-360)*P.scale;
 const nav=makeCampusNavigator(D),home={x:1100,y:220,level:0};
 const actor={x:home.x,y:home.y,h:0,path:[],heading:0,phase:0,blend:0,speed:1.25};
 let model=null,mixer=null,currentAction=null,currentClip='',actions={},naturalSpeeds={},mode='stop',paused=false,followTimer=0,roamWait=0,ready=false,failed=false,lastFocus=null;
 const root=new T.Group();root.name='Élève GLB · test';D.scene.add(root);
 const panel=document.querySelector('#pupilPanel'),status=document.querySelector('#pupilStatus'),badge=document.querySelector('#pupilBadge');
 const buttons=[...panel.querySelectorAll('[data-pupil]')];
 function say(text){if(status.textContent!==text)status.textContent=text;if(badge.textContent!==text)badge.textContent=text;}
 function open(value){panel.hidden=!value;document.querySelector('#pupilButton').setAttribute('aria-expanded',String(value));if(value){document.exitPointerLock?.();lastFocus=document.activeElement;document.querySelector('#pupilClose').focus();}else lastFocus?.focus?.();}
 document.querySelector('#pupilButton').onclick=()=>open(panel.hidden);
 document.querySelector('#pupilClose').onclick=()=>open(false);
 document.addEventListener('keydown',e=>{
  if(e.key.toLowerCase()==='h'&&!e.repeat&&!/INPUT|TEXTAREA|SELECT/.test(e.target.tagName)){e.preventDefault();e.stopImmediatePropagation();open(panel.hidden);}
  else if(!panel.hidden&&e.key==='Escape'){e.preventDefault();e.stopImmediatePropagation();open(false);}
  else if(!panel.hidden&&e.key==='Tab'){
   const focus=[...panel.querySelectorAll('button,input')].filter(b=>!b.disabled),i=focus.indexOf(document.activeElement);
   if(e.shiftKey&&i<=0){e.preventDefault();focus.at(-1).focus();}else if(!e.shiftKey&&i===focus.length-1){e.preventDefault();focus[0].focus();}
  }
 },true);
 function setReady(value){buttons.forEach(b=>b.disabled=!value);document.querySelector('#pupilSpeed').disabled=!value;}
 setReady(false);say('Chargement de l’élève…');
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
 const roamPoints=[{x:1100,y:200,level:0},{x:1250,y:280,level:0},{x:750,y:220,level:0},{x:950,y:330,level:0},{x:600,y:150,level:0}];
 function command(action){
  if(!ready)return false;paused=false;document.querySelector('[data-pupil="pause"]').setAttribute('aria-pressed','false');
  mode=action;actor.path=[];actor.speed=action==='gate'?3:1.25;
  if(action.startsWith('clip:')){const name=action.slice(5);mode=action;play(name);say('Animation sur place · '+clipLabels[name]);return true;}
  if(action==='fr')return route(roomTarget('fr'),'Marche vers la salle de français');
  if(action==='gate')return route({x:1350,y:225,level:0},'Court vers le portail');
  if(action==='home')return route(home,'Retour au point de départ');
  if(action==='roam'){roamWait=0;say('Déplacement libre dans la cour');return true;}
  if(action==='follow'){followTimer=0;say('Te suit en marchant · reste au RDC');return true;}
  mode='stop';say('À l’arrêt');return true;
 }
 function focusActor(){
  const offsets=[[0,3.2],[3.2,0],[-3.2,0],[0,-3.2]];
  for(const [dx,dz]of offsets){const x=X(actor.x)+dx,z=Z(actor.y)+dz;if(D.canMove(x,z,actor.h)){
   D.teleport(x/P.scale+715,z/P.scale+360,0);D.facePoint(X(actor.x),actor.h+1.1,Z(actor.y));return true;
  }}say('Approche-toi de l’élève pour mieux le voir.');return false;
 }
 buttons.forEach(b=>b.onclick=()=>{
  const action=b.dataset.pupil;
  if(action==='focus'){focusActor();open(false);return;}
  if(action==='pause'){paused=!paused;b.setAttribute('aria-pressed',String(paused));say(paused?'Animation et déplacement en pause':'Reprise du test');return;}
  if(action==='reset'){Object.assign(actor,{...home,h:0,path:[],phase:0,blend:0,heading:0});command('stop');focusActor();return;}
  command(action);
 });
 document.querySelector('#pupilSpeed').oninput=e=>{document.querySelector('#pupilSpeedValue').textContent=e.target.value+'×';};
 const clipLabels={dance_01:'Danser',laugh_01:'Rire',flip:'Salto',run_upstairs:'Monter des marches',"press-up":'Faire des pompes',sit:'S’asseoir',walk:'Marcher',run:'Courir'};
 function play(name){
  if(!actions[name]||name===currentClip)return;
  const next=actions[name];next.reset().setEffectiveTimeScale(1).setEffectiveWeight(1).play();
  if(currentAction){currentAction.fadeOut(.2);next.fadeIn(.2);}
  currentAction=next;currentClip=name;
 }
 new T.GLTFLoader().load('assets/characters/eleve.glb?v=2',gltf=>{
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
  root.add(model);play('idle');mixer.update(0);ready=true;setReady(true);say('Élève articulé prêt · H pour choisir une action');
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
   if(mode==='roam'&&!actor.path.length){roamWait-=dt;if(roamWait<=0){const choices=roamPoints.filter(p=>Math.hypot(p.x-actor.x,p.y-actor.y)>60);route(choices[Math.floor(Math.random()*choices.length)],'Déplacement libre dans la cour');roamWait=1.4;}}
   const target=actor.path[0];
   if(target){
    const dx=X(target.x)-X(actor.x),dz=Z(target.y)-Z(actor.y),len=Math.hypot(dx,dz),step=Math.min(len,dt*actor.speed*Number(document.querySelector('#pupilSpeed').value));
    if(len<.025){actor.path.shift();if(!actor.path.length&&!['roam','follow'].includes(mode)){say('Arrivé · '+(mode==='fr'?'salle de français':mode==='gate'?'portail':'point de départ'));mode='stop';}}
    else{
     const nx=X(actor.x)+dx/len*step,nz=Z(actor.y)+dz/len*step;
     for(const door of D.doors)if(Math.abs(door.base-actor.h)<.4&&Math.hypot(nx-door.x,nz-door.z)<1.7)door.open=true;
     // Wait for real door leaves to open instead of walking through them.
     if(D.canMove(nx,nz,actor.h)){
      actor.x+=dx/len*step/P.scale;actor.y+=dz/len*step/P.scale;actor.heading=Math.atan2(dx,dz);traveled=step;
     }
    }
   }
   actor.phase+=traveled*8;actor.blend+=((traveled>0?1:0)-actor.blend)*(1-Math.exp(-dt*10));
   root.rotation.y+=Math.atan2(Math.sin(actor.heading-root.rotation.y),Math.cos(actor.heading-root.rotation.y))*(1-Math.exp(-dt*9));
   const demo=mode.startsWith('clip:')?mode.slice(5):null;
   const clip=demo||(traveled>0?(actor.speed>2?'run':'walk'):'idle');play(clip);
   const rate=Number(document.querySelector('#pupilSpeed').value);
   if(currentAction)currentAction.setEffectiveTimeScale(demo?rate:clip==='idle'?1:actor.speed*rate/Math.max(.1,naturalSpeeds[clip]||actor.speed));
   mixer.update(dt);
  }
  root.position.set(X(actor.x),actor.h,Z(actor.y));
 }
 return{tick,command,focusActor,actor,root,roomTarget,get animation(){return currentClip},get animations(){return Object.keys(actions)},get ready(){return ready},get failed(){return failed},get menuOpen(){return !panel.hidden},get paused(){return paused}};
};

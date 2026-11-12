'use strict';
// Compact cartoon pupils. Joint interface stays compatible with the daily routine.
window.makeCampusStudent=function(T,a,index,scene){
 const profiles=[
 {skin:0xe8bea3,hair:0x50392a,top:0xd9d1c6,pants:0x466279,accent:0xa3766a,style:'cardigan',cut:'long',height:1.61},
 {skin:0xb88663,hair:0x241e1a,top:0x293d4a,pants:0x31383e,accent:0x769294,style:'hoodie',cut:'curls',height:1.72},
 {skin:0xe0b79a,hair:0x3e2d23,top:0x64787b,pants:0x334659,accent:0xd0c7b2,style:'jacket',cut:'bob',height:1.59},
 {skin:0x976749,hair:0x211d1b,top:0x8d697a,pants:0x44495c,accent:0xddd3c2,style:'hoodie',cut:'long',height:1.64},
 {skin:0xf0cfb7,hair:0x9a7045,top:0x6b8066,pants:0x49545e,accent:0xc9b898,style:'cardigan',cut:'waves',height:1.62},
 {skin:0xedc3a4,hair:0x6c4a31,top:0xab8d64,pants:0x354958,accent:0xe7e1d4,style:'jacket',cut:'swept',height:1.75},
 {skin:0xcc9975,hair:0x402b22,top:0xb78176,pants:0x343c45,accent:0xd8d1c6,style:'hoodie',cut:'bob',height:1.60},
 {skin:0x76533d,hair:0x221c18,top:0x647587,pants:0x293139,accent:0xc3baa8,style:'jacket',cut:'curls',height:1.69},
 {skin:0xf1ccb3,hair:0x765737,top:0x78857d,pants:0x4b5a6c,accent:0xdacfc1,style:'cardigan',cut:'long',height:1.63},
 {skin:0xdfb291,hair:0x3d3229,top:0x755b55,pants:0x3e5265,accent:0xe3dcd0,style:'hoodie',cut:'swept',height:1.71}
 ];

 const adult=a.role!=='student',adultProfiles=[
 {skin:0xe8bea3,hair:0x50392a,top:0x526e89,pants:0x344152,accent:0xc4a06e,style:'jacket',cut:'swept'},
 {skin:0xb88663,hair:0x241e1a,top:0x647d75,pants:0x31383e,accent:0xd3b5a2,style:'cardigan',cut:'long'},
 {skin:0xf0cfb7,hair:0x6c4a31,top:0x9b687f,pants:0x44495c,accent:0xd8b5a4,style:'cardigan',cut:'bob'},
 {skin:0xcc9975,hair:0x402b22,top:0x4e7187,pants:0x293139,accent:0xb9cdd4,style:'jacket',cut:'waves'},
 {skin:0x76533d,hair:0x221c18,top:0x927646,pants:0x343c45,accent:0xdac9a7,style:'jacket',cut:'curls'},
 {skin:0xedc3a4,hair:0x99918b,top:0x6c7184,pants:0x3e5265,accent:0xdad7d0,style:'cardigan',cut:'swept'}];
 const adultIndex=Math.max(0,index-10),p=adult?adultProfiles[adultIndex%adultProfiles.length]:profiles[index%profiles.length],g=new T.Group();g.name=(adult?'Adulte':'Élève')+' cartoon · '+a.name;
 g.scale.setScalar(adult?(.98+(adultIndex%3)*.025):(.78+(p.height-1.59)*.22));scene.add(g);
 const colors=[0xeaa475,0x64a9bc,0x9b91cc,0xd989ab,0x83b780,0xe7bd5c,0xde8b76,0x708fca,0x9abca4,0x91a1bd];
 const cache=new Map();function mat(c){if(!cache.has(c))cache.set(c,new T.MeshStandardMaterial({color:c,roughness:.85}));return cache.get(c);}
 const skin=mat(p.skin),hair=mat(p.hair),top=mat(adult?p.top:colors[index%colors.length]),pants=mat(p.pants),white=mat(0xfff6e6),ink=mat(0x263443),accent=mat(p.accent);
 function mesh(geo,m,x,y,z,parent=g){const o=new T.Mesh(geo,m);o.position.set(x,y,z);o.castShadow=o.receiveShadow=true;parent.add(o);return o;}
 function ell(rx,ry,rz,m,x,y,z,parent=g){const o=mesh(new T.SphereGeometry(1,20,14),m,x,y,z,parent);o.scale.set(rx,ry,rz);return o;}
 function rod(from,to,r,m,parent=g){const d=new T.Vector3(...to).sub(new T.Vector3(...from)),o=mesh(new T.CylinderGeometry(r,r,d.length(),12),m,...from,parent);o.position.addScaledVector(d,.5);o.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),d.normalize());return o;}
 // Round, deliberately oversized head with a clear smiling expression.
 ell(.235,.285,.215,skin,0,1.59,.01);ell(.17,.15,.155,skin,0,1.43,.065);
 for(const sign of [-1,1]){
 ell(.05,.065,.041,skin,sign*.235,1.57,.006);
 ell(.034,.019,.008,mat(new T.Color(p.skin).lerp(new T.Color(0xe88782),.3).getHex()),sign*.139,1.505,.187);
 ell(.053,.068,.024,white,sign*.086,1.607,.2);
 ell(.026,.044,.015,ink,sign*.086,1.604,.221);
 ell(.009,.014,.006,white,sign*.079,1.621,.235);
 rod([sign*.045,1.714,.191],[sign*.119,1.721,.171],.011,hair);
 }
 ell(.036,.028,.038,skin,0,1.55,.224);
 const smile=[];for(let n=0;n<=12;n++){const x=(n/12-.5)*.12;smile.push(new T.Vector3(x,1.465+.028*Math.pow(x/.06,2),.217-.015*Math.pow(x/.06,2)));}
 mesh(new T.TubeGeometry(new T.CatmullRomCurve3(smile),16,.007,8,false),ink,0,0,0);
 // Hair is sculpted in a few soft, readable masses rather than tiny strands.
 ell(.239,.17,.22,hair,0,1.767,-.023);
 if(['long','waves','bob'].includes(p.cut)){
 const long=p.cut!=='bob';ell(.226,long?.25:.16,.095,hair,0,long?1.52:1.61,-.159);
 for(const sign of [-1,1]){ell(.074,long?.255:.17,.11,hair,sign*.194,long?1.53:1.61,-.034);}
 for(let n=0;n<5;n++){const o=ell(.065,.073,.055,hair,-.16+n*.08,1.755+(n%2)*.018,.158);o.rotation.z=-.25;}
 }else if(p.cut==='curls'){
 for(let n=0;n<16;n++){const t=n*2.4;ell(.069,.067,.062,hair,Math.sin(t)*.18,1.785+(n%3)*.035,Math.cos(t)*.16-.015);}
 }else{for(let n=0;n<5;n++){const o=ell(.079,.064,.065,hair,-.14+n*.067,1.763+n*.012,.145);o.rotation.z=-.4;}}
 // Short torso, broad soft sleeves and chunky sneakers establish the cartoon silhouette.
 ell(.226,.27,.137,top,0,1.12,0);ell(.18,.095,.115,pants,0,.865,0);
 const collar=mesh(new T.TorusGeometry(.072,.013,8,24),accent,0,1.35,0);collar.rotation.x=Math.PI/2;
 if(p.style==='hoodie'){
 ell(.132,.09,.06,top,0,1.32,-.11);ell(.115,.048,.017,accent,0,1.02,.132);
 for(const sign of [-1,1])rod([sign*.04,1.323,.095],[sign*.04,1.22,.133],.005,white);
 }else{
 rod([0,.93,.127],[0,1.33,.088],.006,accent);
 for(let n=0;n<4;n++)ell(.009,.009,.004,white,.018,1+n*.072,.139);
 }
 const limbs=[];
 for(const sign of [-1,1]){
 const arm=new T.Group();arm.position.set(sign*.228,1.275,0);arm.rotation.z=sign*.12;g.add(arm);
 rod([0,0,0],[0,-.2,0],.067,top,arm);ell(.067,.067,.067,top,0,0,0,arm);
 const elbow=new T.Group();elbow.position.y=-.2;arm.add(elbow);
 rod([0,0,0],[0,-.17,.008],.057,top,elbow);ell(.058,.06,.057,top,0,0,0,elbow);
 ell(.053,.065,.043,skin,0,-.215,.016,elbow);ell(.022,.029,.023,skin,-sign*.045,-.195,.035,elbow);
 const leg=new T.Group();leg.position.set(sign*.105,.86,0);g.add(leg);
 rod([0,0,0],[0,-.36,0],.077,pants,leg);ell(.077,.077,.077,pants,0,0,0,leg);
 const knee=new T.Group();knee.position.y=-.36;leg.add(knee);
 ell(.071,.071,.071,pants,0,0,0,knee);rod([0,0,0],[0,-.345,0],.065,pants,knee);
 ell(.085,.045,.145,white,0,-.412,.064,knee);ell(.079,.066,.127,top,0,-.375,.067,knee);
 ell(.075,.031,.073,white,0,-.386,.151,knee);
 for(let n=0;n<3;n++)rod([-.035,-.319-n*.011,.045+n*.023],[.035,-.319-n*.011,.045+n*.023],.004,white,knee);
 limbs.push({arm,elbow,leg,knee,sign});
 }
 if(!adult){ell(.15,.185,.085,accent,0,1.1,-.172);ell(.105,.074,.035,top,0,1.042,-.247);
 for(const sign of [-1,1])rod([sign*.124,1.31,-.08],[sign*.15,1.045,.104],.014,ink);}
 else{
 if(a.role==='supervisor'){rod([-.065,1.34,.065],[0,1.14,.144],.006,accent);rod([.065,1.34,.065],[0,1.14,.144],.006,accent);mesh(new T.BoxGeometry(.08,.065,.009),white,0,1.13,.145);mesh(new T.BoxGeometry(.046,.011,.011),top,0,1.132,.152);}
 if(a.role==='teacher'||['cpe','director','cdi'].includes(a.id)){for(const sign of [-1,1]){const rim=mesh(new T.TorusGeometry(.063,.006,8,24),ink,sign*.086,1.607,.229);rim.scale.y=1.16;}rod([-.024,1.613,.23],[.024,1.613,.23],.006,ink);}
 if(a.id==='director'||a.id==='martin'){mesh(new T.ConeGeometry(.025,.16,4),accent,0,1.21,.137);}
 }
 function compact(parent){const groups=new Map();for(const o of [...parent.children]){if(!o.isMesh)continue;o.updateMatrix();const geometry=o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone();geometry.applyMatrix4(o.matrix);const key=o.material.uuid;if(!groups.has(key))groups.set(key,{m:o.material,parts:[]});groups.get(key).parts.push(geometry);o.removeFromParent();o.geometry.dispose();}for(const {m,parts}of groups.values()){const out=new T.BufferGeometry();for(const key of ['position','normal','uv']){const arr=new Float32Array(parts.reduce((n,q)=>n+q.attributes[key].array.length,0));let pos=0;for(const q of parts){arr.set(q.attributes[key].array,pos);pos+=q.attributes[key].array.length;}out.setAttribute(key,new T.BufferAttribute(arr,key==='uv'?2:3));}out.computeBoundingSphere();mesh(out,m,0,0,0,parent);parts.forEach(q=>q.dispose());}}
 for(const l of limbs){compact(l.arm);compact(l.elbow);compact(l.leg);compact(l.knee);}compact(g);
 const c=document.createElement('canvas');c.width=512;c.height=128;const ctx=c.getContext('2d');ctx.fillStyle='#172c35dd';ctx.fillRect(0,0,512,128);ctx.fillStyle='#fff';ctx.textAlign='center';ctx.font='600 48px Arial';ctx.fillText(a.name,256,80,490);
 const tex=new T.CanvasTexture(c);tex.colorSpace=T.SRGBColorSpace;const label=new T.Sprite(new T.SpriteMaterial({map:tex,depthTest:true}));label.position.y=2.16;label.scale.set(1.35,.3375,1);g.add(label);
 g.userData={model:adult?'cartoon-adult-v1':'cartoon-student-v1',height:1.93*g.scale.y,clothing:p.style,haircut:p.cut,skin:p.skin,articulatedKnees:true};return{g,limbs,label};
};

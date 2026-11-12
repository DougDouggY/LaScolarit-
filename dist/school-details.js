// Materials and metre-scale furniture shared by campus, classroom and dining scenes.
window.schoolDetail = (() => {
 const T=THREE, cache=new Map();
 function texture(kind){
  if(cache.has(kind))return cache.get(kind);
  const c=document.createElement('canvas');c.width=c.height=512;const g=c.getContext('2d');
  const bases={concrete:'#b5b6b3',stone:'#b9b7af',wood:'#ba956b',plaster:'#e7e4dc',ceiling:'#e6e4df',vinyl:'#c5c3b9',fabric:'#658080'};
  g.fillStyle=bases[kind]||bases.vinyl;g.fillRect(0,0,512,512);
  let seed=137;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};
  const count=kind==='wood'?2100:18000;
  for(let i=0;i<count;i++){const x=random()*512,y=random()*512,v=random();g.fillStyle=v<.5?'rgba(27,24,19,.045)':'rgba(255,255,255,.12)';
   if(kind==='wood'){g.fillRect(x,y,.4+random(),10+random()*70)}else if(kind==='stone'){g.beginPath();g.ellipse(x,y,.3+random()*1.9,.3+random()*1.6,random()*3,0,6.29);g.fill()}else g.fillRect(x,y,random()*1.3+.4,random()*1.3+.4)
  }
  if(kind==='vinyl'||kind==='stone'){g.strokeStyle='#aaa99e';g.lineWidth=1;g.strokeRect(.5,.5,511,511)}
  if(kind==='ceiling'){g.strokeStyle='#c4c2ba';g.lineWidth=4;g.strokeRect(2,2,508,508)}
  const t=new T.CanvasTexture(c);t.wrapS=t.wrapT=T.RepeatWrapping;t.colorSpace=T.SRGBColorSpace;t.anisotropy=4;cache.set(kind,t);return t;
 }
 function material(kind,roughness=.7,color=0xffffff){return new T.MeshStandardMaterial({map:texture(kind),color,roughness,metalness:0,bumpMap:texture(kind),bumpScale:kind==='wood'?.004:.009})}
 function materials(m){Object.assign(m,{wall:material('plaster',.9),wallDark:new T.MeshStandardMaterial({color:0x414b51,roughness:.7}),floor:material('concrete',.95),tile:material('stone',.42),wood:material('wood',.53,0xcbb79a),woodLight:material('wood',.52),desk:material('wood',.47,0xe1d6c1),metal:new T.MeshStandardMaterial({color:0x737d81,roughness:.38,metalness:.72}),seat:new T.MeshStandardMaterial({color:0x486979,roughness:.56}),lowerWall:new T.MeshStandardMaterial({color:0x989e9b,roughness:.75}),trim:new T.MeshStandardMaterial({color:0x565f64,roughness:.65}),glass:new T.MeshStandardMaterial({color:0xd0e0e0,roughness:.12,metalness:.1,transparent:true,opacity:.22,depthWrite:false}),libraryFloor:material('wood',.53),ceiling:material('ceiling',.92),classFloor:material('vinyl',.6),chalk:new T.MeshStandardMaterial({color:0x344b44,roughness:.94})});return m}
 function piece(group,w,h,d,mat,x,y,z){const mesh=new T.Mesh(new T.BoxGeometry(w,h,d),mat);mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;group.add(mesh);return mesh}
 function chair(stage,m,x,z,angle=0){const g=new T.Group();g.position.set(x,0,z);g.rotation.y=angle;stage.add(g);
  piece(g,.44,.035,.43,m.woodLight,0,.46,0);piece(g,.44,.24,.028,m.woodLight,0,.73,.2);
  for(const dx of [-.19,.19]){for(const dz of [-.17,.17])piece(g,.025,.44,.025,m.metal,dx,.22,dz);piece(g,.025,.4,.025,m.metal,dx,.65,.19)}
  piece(g,.4,.023,.023,m.metal,0,.23,.16);for(const dx of [-.19,.19])for(const dz of [-.17,.17])piece(g,.035,.022,.035,m.trim,dx,.013,dz);return g
 }
 function desk(stage,m,x,z,angle=0,teacher=false){const g=new T.Group();g.position.set(x,0,z);g.rotation.y=angle;stage.add(g);const w=teacher?1.65:1.15,d=teacher?.75:.65;
  piece(g,w,.04,d,m.desk,0,.76,0);piece(g,w+.004,.022,d+.004,m.trim,0,.728,0);
  for(const dx of [-w/2+.09,w/2-.09])for(const dz of [-d/2+.08,d/2-.08])piece(g,.035,.72,.035,m.metal,dx,.36,dz);
  piece(g,w-.16,.032,.032,m.metal,0,.57,d/2-.08);
  if(teacher){piece(g,.37,.6,.6,m.woodLight,w/2-.27,.4,0);for(const y of [.29,.5,.69]){piece(g,.32,.17,.015,m.woodLight,w/2-.27,y,-.31);piece(g,.12,.014,.022,m.metal,w/2-.27,y,-.33)}piece(g,w-.68,.4,.025,m.woodLight,-.16,.47,.27)}
  chair(g,m,0,.73);return g
 }
 function dish(stage,m,name,x,y,z,scale=1){const group=new T.Group();group.name=name;group.position.set(x,y,z);group.scale.setScalar(scale);stage.add(group);
  const colors={chicken:0xb77235,gratin:0xd3a850,rice:0xeee3cb,beans:0x548145,apple:0xbd3d32,yogurt:0xf5f4ec};const food=new T.MeshStandardMaterial({color:colors[name],roughness:.78});
  function sphere(px,py,pz,sx,sy,sz,mat=food){const o=new T.Mesh(new T.SphereGeometry(1,14,10),mat);o.scale.set(sx,sy,sz);o.position.set(px,py,pz);o.castShadow=true;group.add(o);return o}
  if(name==='chicken'){sphere(0,.085,0,.19,.11,.13);sphere(.17,.08,.05,.12,.065,.065);const bone=new T.Mesh(new T.CylinderGeometry(.018,.018,.13,8),m.wall);bone.rotation.z=-1.05;bone.position.set(.29,.09,.05);group.add(bone)}
  if(name==='gratin'){piece(group,.4,.055,.3,food,0,.04,0);for(let i=0;i<15;i++)sphere((i%5-2)*.075,.085,(Math.floor(i/5)-1)*.08,.045,.015,.035,i%3?food:new T.MeshStandardMaterial({color:0x6b8849,roughness:.85}))}
  if(name==='rice')for(let i=0;i<65;i++){const angle=i*2.399,r=.17*Math.sqrt(i/65);sphere(Math.cos(angle)*r,.025+.07*(1-r/.2),Math.sin(angle)*r,.016,.01,.007)}
  if(name==='beans')for(let i=0;i<16;i++){const bean=piece(group,.21,.018,.018,food,(i%4-1.5)*.05,.025+Math.floor(i/4)*.016,(i%3-1)*.055);bean.rotation.y=i*.8}
  if(name==='apple'){sphere(0,.105,0,.105,.11,.1);piece(group,.014,.045,.013,m.wood,0,.228,0);const leaf=piece(group,.055,.006,.028,new T.MeshStandardMaterial({color:0x4b7540}),.023,.24,0);leaf.rotation.z=.3}
  if(name==='yogurt'){const cup=new T.Mesh(new T.CylinderGeometry(.075,.054,.12,20),food);cup.position.y=.065;group.add(cup);const lid=new T.Mesh(new T.CylinderGeometry(.08,.08,.009,20),new T.MeshStandardMaterial({color:0x6f9eaa,metalness:.3,roughness:.4}));lid.position.y=.13;group.add(lid)}return group
 }
 return {materials,material,texture,piece,chair,desk,dish};
})();

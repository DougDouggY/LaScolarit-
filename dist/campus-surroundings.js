// Static urban scenery, outside the approved school plan.
'use strict';
window.buildCampusSurroundings=function({T,P,M,material,box,pbox,rod,solid,root,X,Z,addDoor}){
 const plaza={x:1380,y:140,w:260,h:200};
 const west=Math.min(...P.outline.map(p=>p[0]))-45,south=Math.max(...P.outline.map(p=>p[1]))+45;
 const safe=[plaza,{x:1600,y:5,w:40,h:south-5},{x:west,y:5,w:1600-west,h:45},{x:west,y:50,w:45,h:south-50},{x:west,y:south-45,w:1600-west,h:45},{x:1000,y:670,w:600,h:45},{x:1000,y:715,w:45,h:south-715}];
 const roads=[{x:west-140,y:-135,w:1780-west+140,h:140},{x:west-140,y:south,w:1780-west+140,h:140},{x:west-140,y:5,w:140,h:south-5},{x:1640,y:5,w:140,h:south-5}];
 const inside=(r,x,y)=>x>=r.x&&x<=r.x+r.w&&y>=r.y&&y<=r.y+r.h;
 const crossingZone={x:1625,y:188,w:170,h:74};
 const gymAccess=[{x:1778,y:188,w:22,h:150},{x:1780,y:282,w:420,h:56}];safe.push(crossingZone,...gymAccess);
 const onRoad=(x,y,radius=0)=>!(x-radius>=crossingZone.x&&x+radius<=crossingZone.x+crossingZone.w&&y-radius>=crossingZone.y&&y+radius<=crossingZone.y+crossingZone.h)&&roads.some(r=>x+radius>r.x&&x-radius<r.x+r.w&&y+radius>r.y&&y-radius<r.y+r.h);
 const pavement=material(0xd4d0c5,.89,0,'paving'),asphalt=material(0x555a5e,.98,0,'asphalt'),curb=material(0xc6c6bf,.87,0,'concrete'),mark=material(0xe3e0cb,.85),soil=material(0x494d36,.97),grass=material(0x66714d,.98);
 pavement.userData.textureScale=[1.2,.6];
 pbox(-700,-650,4400,2100,-.2,.16,grass);
 for(const r of roads)pbox(r.x,r.y,r.w,r.h,-.055,.12,asphalt);
 for(const r of safe.filter(r=>r!==crossingZone))pbox(r.x,r.y,r.w,r.h,0,.12,pavement);
 // Raised kerbs visually explain the point at which walking is stopped.
 for(const[axis,fixed,a,b]of [['x',5,west,1640],['x',south,west,1640],['z',west,5,south],['z',1640,5,south]]){
  const length=(b-a)*P.scale;box(axis==='x'?length:.15,.13,axis==='x'?.15:length,curb,axis==='x'?X((a+b)/2):X(fixed),-.015,axis==='x'?Z(fixed):Z((a+b)/2));
 }
 // Dashed road centre lines continue along all four sides, with corner clearance.
 for(const y of [-65,south+70])for(let x=west+35;x<1700;x+=90)box(2,.008,.1,mark,X(x),-.047,Z(y));
 for(const x of [west-70,1710])for(let y=65;y<south-55;y+=90)box(.1,.008,2,mark,X(x),-.047,Z(y));
 // The marked crossing is the only authorised route through the road.
 const crossing={x:1710,y:225,stripeAxis:'z',travelAxis:'x'};for(let n=0;n<7;n++)box(.36,.008,3.4,mark,X(1650+n*20),-.046,Z(225));
 // Planting beside the plaza is landscaping, never another courtyard.
 for(const r of [{x:1390,y:55,w:195,h:65},{x:1390,y:365,w:195,h:288}]){
  pbox(r.x,r.y,r.w,r.h,-.02,.1,soil);
  box(r.w*P.scale,.2,.15,curb,X(r.x+r.w/2),.03,Z(r.y));box(r.w*P.scale,.2,.15,curb,X(r.x+r.w/2),.03,Z(r.y+r.h));
 }
 const leafMats=[0x52694c,0x687b52,0x7b8455].map(c=>material(c,.98)),bark=material(0x62534b,.95,0,'concrete');
 function tree(px,py,size=1){const x=X(px),z=Z(py),h=3.4*size;rod([x,0,z],[x+.12,h,z],.085*size,bark);for(let i=0;i<3;i++){const a=i*2.1;rod([x,h*.6,z],[x+Math.cos(a)*.7*size,h*.95,z+Math.sin(a)*.7*size],.035*size,bark);const foliage=new T.Mesh(new T.IcosahedronGeometry(1.25*size,2),leafMats[i]);foliage.position.set(x+Math.cos(a)*.45*size,h+(.2+i*.25)*size,z+Math.sin(a)*.45*size);foliage.scale.set(1,.78,1);foliage.castShadow=foliage.receiveShadow=true;root.add(foliage);}}
 for(const[px,py,s]of [[1490,85,1],[1490,400,1.1],[1490,525,1.2],[1515,625,.95]])tree(px,py,s);
 function bench(px,py,reverse=false){const x=X(px),z=Z(py),sign=reverse?-1:1;for(const dx of [-.8,.8]){box(.065,.43,.6,M.frame,x+dx,.215,z);box(.065,.52,.055,M.frame,x+dx,.69,z-sign*.24);}for(let n=0;n<4;n++)box(1.9,.04,.095,M.wood,x,.45,z+sign*(-.18+n*.12));for(let n=0;n<3;n++)box(1.9,.1,.035,M.wood,x,.62+n*.14,z-sign*.25);solid(x-1,x+1,z-.31,z+.31,0,1.05,'plaza-bench');}
 bench(1470,151);bench(1470,328,true);
 // Courtyard planters stay clear of the painted ranks and both entrances.
 const courtGreenery=[];for(const[px,py,size]of [[575,90,.8],[940,80,.9],[1280,90,.95],[1330,310,.8]]){const x=X(px),z=Z(py),w=1.25;box(w,.38,w,curb,x,.19,z);box(w-.12,.035,w-.12,soil,x,.385,z);tree(px,py,size);for(let i=0;i<4;i++){const shrub=new T.Mesh(new T.IcosahedronGeometry(.26,1),leafMats[i%3]);shrub.position.set(x+Math.cos(i*1.57)*.32,.55,z+Math.sin(i*1.57)*.32);shrub.scale.y=.65;root.add(shrub);}solid(x-w/2,x+w/2,z-w/2,z+w/2,0,.75,'court-planter');courtGreenery.push({px,py});}
 function lamp(px,py){const x=X(px),z=Z(py);box(.19,.14,.19,M.metal,x,.07,z);rod([x,0,z],[x,4.5,z],.047,M.frame);rod([x,4.5,z],[x+.65,4.5,z],.033,M.frame);box(.62,.085,.24,M.frame,x+.75,4.47,z);box(.51,.015,.16,M.white,x+.75,4.42,z);}
 for(const[px,py]of [[1622,85],[1622,345],[1622,605],[210,26],[840,26],[1180,694]])lamp(px,py);
 // Low bollards retain a wide clear passage from the gate to the plaza.
 for(const py of [150,180,270,305]){const x=X(1625),z=Z(py);rod([x,0,z],[x,.86,z],.055,M.frame);box(.115,.035,.115,M.metal,x,.86,z);solid(x-.06,x+.06,z-.06,z+.06,0,.88,'plaza-bollard');}
 // Window reveals, shutters, cornices and roofs give depth from either storey.
 // All these facades remain beyond the road and outside the movement domain.
 const facadeMats=[0xe0d5be,0xb6b7b0,0xc3b19e,0xd7d3c7,0xc6cec8].map(c=>material(c,.91,0,'plaster'));
 const roofMats=[0x79685b,0x575d60,0x9e6d52].map(c=>material(c,.86,0,'paving')),shutterMats=[0x61757d,0x697360,0x8d766a].map(c=>material(c,.82,0,'coating'));
 const cityGlass=material(0x455c68,.23,.25),windowTrim=material(0xd6d3c7,.8),cityBuildings=[];
 function building(px,py,angle,index,storeys=3){const width=8.2+(index%3)*1.7,depth=7.8,height=storeys*2.95+.4,g=new T.Group();g.position.set(X(px),0,Z(py));g.rotation.y=angle;root.add(g);cityBuildings.push({px,py,storeys,width,height});
  const facade=facadeMats[index%facadeMats.length],roofMat=roofMats[index%3],shutter=shutterMats[index%3];box(width,height,depth,facade,0,height/2,0,g);box(width+.16,.3,depth+.16,windowTrim,0,.2,0,g);
  for(let floor=0;floor<storeys;floor++){const y=1.63+floor*2.95;box(width+.12,.09,.18,windowTrim,0,floor*2.95+.38,depth/2+.04,g);
   for(let col=0;col<3;col++){const x=(col-1)*width*.285;box(1.35,1.65,.045,M.frame,x,y,depth/2+.032,g);box(1.2,1.5,.025,cityGlass,x,y,depth/2+.066,g);for(const dx of [-.63,.63])box(.075,1.65,.11,windowTrim,x+dx,y,depth/2+.09,g);for(const dy of [-.8,.8])box(1.4,.075,.11,windowTrim,x,y+dy,depth/2+.09,g);box(.035,1.53,.06,windowTrim,x,y,depth/2+.1,g);box(1.52,.07,.28,windowTrim,x,y-.86,depth/2+.1,g);
    if((col+floor+index)%3!==0)for(const side of [-1,1]){const sx=x+side*.99;box(.55,1.66,.065,shutter,sx,y,depth/2+.06,g);for(let slat=0;slat<9;slat++)box(.46,.018,.012,M.frame,sx,y-.66+slat*.165,depth/2+.097,g);}
    if(floor===1&&col===1&&index%2===0){box(1.9,.12,.65,curb,x,y-.92,depth/2+.3,g);rod([x-.9,y-.86,depth/2+.58],[x-.9,y-.1,depth/2+.58],.025,M.frame,g);rod([x+.9,y-.86,depth/2+.58],[x+.9,y-.1,depth/2+.58],.025,M.frame,g);rod([x-.9,y-.1,depth/2+.58],[x+.9,y-.1,depth/2+.58],.025,M.frame,g);for(let b=0;b<9;b++)rod([x-.8+b*.2,y-.86,depth/2+.58],[x-.8+b*.2,y-.1,depth/2+.58],.012,M.frame,g);}
   }
  }
  box(1.15,2.2,.055,M.wood,0,1.1,depth/2+.045,g);box(1.4,.14,.35,windowTrim,0,2.3,depth/2+.13,g);box(.05,.13,.04,M.metal,.37,1,depth/2+.1,g);
  for(const side of [-1,1]){const roof=box(width+.65,.16,depth*.57,roofMat,0,height+.8,side*depth*.25,g);roof.rotation.x=side*.36;}
  box(.6,1.6,.6,facade,width*.25,height+1.2,-depth*.12,g);box(.75,.12,.75,M.frame,width*.25,height+2.02,-depth*.12,g);
  box(width+.3,.12,.3,windowTrim,0,height+.05,depth/2+.08,g);rod([-width/2+.2,.3,depth/2+.13],[-width/2+.2,height,depth/2+.13],.045,M.frame,g);
 }
 let index=0;for(let x=-60;x<1760;x+=240){building(x,-270,0,index,index%3===0?2:3);index++;building(x,south+275,Math.PI,index,index%4===0?4:3);index++;}
 for(let y=70;y<south+65;y+=225){building(west-275,y,Math.PI/2,index++,3);building(1915,y===70?-200:y===295?70:y,-Math.PI/2,index++,3);}
 for(const[px,py]of [[west-65,-110],[1830,-110],[west-65,south+130],[1830,south+130],[1850,360],[west-65,350]])tree(px,py,1.2);
 // A second, cheaper skyline prevents empty gaps behind the front facades.
 for(let n=0;n<14;n++){const px=-330+n*170,h=9+(n%4)*2;box(6.5,h,7,facadeMats[n%5],X(px),h/2,Z(-485));box(7.8,h+1,8,facadeMats[(n+2)%5],X(px),h/2+.5,Z(south+520));}

 for(const [px,py,a]of [[2200,-180,0],[2490,-180,0],[2780,-180,0],[3130,-180,0],[2230,960,Math.PI],[2520,960,Math.PI],[2810,960,Math.PI],[3130,960,Math.PI],[3320,130,-Math.PI/2],[3320,440,-Math.PI/2],[3320,740,-Math.PI/2]])building(px,py,a,index++,3);
 for(let py=-350;py<1300;py+=170)box(8,12,8,facadeMats[Math.abs(py)%5],X(3530),6,Z(py));
 // Furnished edges leave the entrance axis, class ranks and canteen queue open.
 const exteriorDecor=[];
 function litterBin(px,py){const x=X(px),z=Z(py);box(.42,.7,.42,M.frame,x,.35,z);box(.46,.05,.46,M.metal,x,.73,z);box(.28,.025,.28,soil,x,.76,z);for(let n=0;n<5;n++)box(.014,.59,.014,M.metal,x-.16+n*.08,.36,z+.219);solid(x-.23,x+.23,z-.23,z+.23,0,.8,'court-bin');exteriorDecor.push({kind:'bin',px,py});}
 for(const [px,py]of [[710,76],[1170,76],[1340,150],[1580,155]])litterBin(px,py);
 bench(660,77);bench(1210,77);exteriorDecor.push({kind:'bench',px:660,py:77},{kind:'bench',px:1210,py:77});
 // Low flower beds include stems and petals rather than plain green blocks.
 const flowerMat=[0xd8b45e,0xb5707c,0xc5cbdc].map(c=>material(c,.87));
 for(const [px,py]of [[1420,100],[1545,400],[1450,615]]){for(let i=0;i<14;i++){const x=X(px)+(i%7-.3)*.13,z=Z(py)+Math.floor(i/7)*.16,h=.3+(i%3)*.06;rod([x,.05,z],[x,h,z],.007,leafMats[0]);for(let n=0;n<5;n++){const o=new T.Mesh(new T.SphereGeometry(.038,7,5),flowerMat[i%3]);o.scale.y=.35;o.position.set(x+Math.cos(n*1.257)*.032,h,z+Math.sin(n*1.257)*.032);root.add(o);}}exteriorDecor.push({kind:'flowers',px,py});}
 // A proper bicycle rack sits on the outer plaza edge, away from the gate.
 for(let n=0;n<5;n++){const x=X(1570),z=Z(300+n*7);rod([x-.28,.05,z],[x-.28,.7,z],.026,M.metal);rod([x-.28,.7,z],[x+.28,.7,z],.026,M.metal);rod([x+.28,.7,z],[x+.28,.05,z],.026,M.metal);}solid(X(1560),X(1580),Z(296),Z(332),0,.73,'plaza-cycle-rack');exteriorDecor.push({kind:'cycle-rack',px:1570,py:314});
 // Exterior glazed notice case is fixed to the school facade.
 {const g=new T.Group();g.position.set(X(530)+.16,1.55,Z(258));g.rotation.y=Math.PI/2;root.add(g);box(1.25,.88,.085,M.frame,0,0,0,g);box(1.12,.75,.02,M.white,0,0,.052,g);for(let n=0;n<3;n++){box(.27,.49,.012,flowerMat[n],-.37+n*.37,0,.07,g);for(let k=0;k<5;k++)box(.2,.015,.004,M.frame,-.37+n*.37,.15-k*.075,.078,g);}exteriorDecor.push({kind:'notice-case',px:530,py:258});}
 // Seating walls and flowering shrubs at the small square.
 for(const [px,py]of [[1420,390],[1560,585]]){const x=X(px),z=Z(py);box(1.5,.4,.6,curb,x,.2,z);box(1.58,.045,.66,M.wood,x,.435,z);solid(x-.8,x+.8,z-.35,z+.35,0,.48,'plaza-seat');exteriorDecor.push({kind:'seat',px,py});}

 // Light steel and translucent polycarbonate canopy beside entrance A and WCs.
 const canopy={x:530,y:150,w:100,h:220,roofHeight:3.08};
 const canopyRoof=new T.MeshPhysicalMaterial({color:0xdbe4e2,transparent:true,opacity:.66,roughness:.35,side:T.DoubleSide});
 for(const py of [155,265,365]){const x=X(625),z=Z(py);box(.095,3.02,.095,M.frame,x,1.51,z);box(.22,.06,.22,M.metal,x,.03,z);solid(x-.07,x+.07,z-.07,z+.07,0,3.1,'canopy-post');}
 for(const px of [533,625])box(.1,.14,220*P.scale,M.frame,X(px),3.03,Z(260));
 for(let py=150;py<370;py+=22){box(4.35,.085,.05,M.frame,X(578.5),3.04,Z(py));box(4.4,.025,.97,canopyRoof,X(579),3.12,Z(py+10.5));}
 // Original painted fresco on the blank court-facing wall; no frame.
 const muralTexture=new T.TextureLoader().load('assets/classroom-posters/mural.jpg');muralTexture.colorSpace=T.SRGBColorSpace;muralTexture.anisotropy=4;
 const mural=new T.Mesh(new T.PlaneGeometry(6.9,2.3),new T.MeshStandardMaterial({map:muralTexture,roughness:.98}));mural.position.set(X(960),1.62,Z(370)-.13);mural.rotation.y=Math.PI;root.add(mural);exteriorDecor.push({kind:'mural',px:960,py:370,width:6.9,height:2.3});
 // Bus shelter beyond the road remains part of the inaccessible city scenery.
 const busStop={px:1810,py:225,inaccessible:true};
 {const g=new T.Group();g.position.set(X(busStop.px),0,Z(busStop.py));g.rotation.y=-Math.PI/2;root.add(g);box(4.1,.13,1.6,M.frame,0,2.85,0,g);for(const x of [-1.9,1.9])for(const z of [-.6,.6])box(.065,2.8,.065,M.frame,x,1.4,z,g);box(3.74,2.32,.025,M.glass,0,1.35,-.6,g);for(const x of [-1.9,1.9])box(.025,2.3,1.2,M.glass,x,1.35,0,g);box(2.5,.08,.42,M.wood,0,.48,-.21,g);for(const x of [-1.05,1.05])box(.06,.42,.32,M.frame,x,.24,-.21,g);const cv=document.createElement('canvas');cv.width=1024;cv.height=256;const ctx=cv.getContext('2d');ctx.fillStyle='#345b6c';ctx.fillRect(0,0,1024,256);ctx.fillStyle='#fff';ctx.font='bold 84px Arial';ctx.textAlign='center';ctx.fillText('ARRÊT COLLÈGE',512,154);const tex=new T.CanvasTexture(cv);tex.colorSpace=T.SRGBColorSpace;const sign=new T.Mesh(new T.PlaneGeometry(2.7,.55),new T.MeshStandardMaterial({map:tex}));sign.position.set(0,2.51,.64);g.add(sign);box(.7,1.13,.05,M.white,1.3,1.62,-.56,g);for(let n=0;n<7;n++)box(.48,.018,.006,M.frame,1.3,1.96-n*.1,-.526,g);}
 exteriorDecor.push({kind:'bus-stop',px:1810,py:225});
 const gym=window.buildCampusGym({T,P,M,material,box,pbox,rod,solid,root,X,Z,addDoor});safe.push(gym.footprint);
 return{gym,gymAccess,crossingZone,crossing,canopy,busStop,exteriorDecor,plaza,safe,roads,cityBuildings,courtGreenery,onRoad,isSafe:(x,y)=>safe.some(r=>inside(r,x,y))};
};

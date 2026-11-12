'use strict';
window.buildCampusGym=function({T,P,M,material,box,pbox,rod,solid,root,X,Z,addDoor}){
 const footprint={x:2180,y:80,w:850,h:620},height=8.4,door={id:'gym-entrance',name:'Gymnase',axis:'z',fixed:2180,a:275,b:345};
 const stone=material(0xc5c8c2,.91,0,'concrete'),cladding=material(0x697d87,.67,.28,'coating'),wood=material(0xba9064,.67,0,'wood'),line=material(0xf0e9cf,.78),blue=material(0x396887,.75),red=material(0xac654b,.8),padding=material(0x657e82,.93),net=material(0xe4e3d8,.9);
 const x0=X(2180),x1=X(3030),z0=Z(80),z1=Z(700),cx=(x0+x1)/2,cz=(z0+z1)/2,w=x1-x0,d=z1-z0;
 pbox(2180,80,850,620,-.14,.14,wood);
 function wall(x,z,width,depth,base,h){box(width,h,depth,base<3?stone:cladding,x,base+h/2,z);solid(x-width/2,x+width/2,z-depth/2,z+depth/2,base,base+h,'gym-wall');}
 for(const z of [z0,z1]){wall(cx,z,w,.24,0,4.8);wall(cx,z,w,.24,6.45,1.95);for(let x=x0+.7;x<x1-.7;x+=1.8){box(1.72,1.58,.02,M.windowGlass,x,5.625,z);box(.055,1.65,.18,M.frame,x-.9,5.625,z);}for(const y of [4.8,6.45])box(w,.07,.2,M.frame,cx,y,z);solid(x0,x1,z-.12,z+.12,4.8,6.45,'gym-glass');}
 wall(x1,cz,.24,d,0,height);
 wall(x0,(z0+Z(275))/2,.24,Z(275)-z0,0,height);wall(x0,(Z(345)+z1)/2,.24,z1-Z(345),0,height);wall(x0,Z(310),.24,70*P.scale,2.25,height-2.25);addDoor(door,0,'left');
 for(let x=x0+.35;x<x1;x+=2.4){for(const z of [z0+.16,z1-.16])box(.2,8.2,.2,M.frame,x,4.1,z);box(.16,.24,d,M.frame,x,7.9,cz);for(let j=0;j<8;j++){const za=z0+j*d/8,zb=z0+(j+1)*d/8;rod([x,7.92,za],[x,7.25,zb],.035,M.metal);rod([x,7.25,za],[x,7.92,zb],.035,M.metal);}box(.085,.085,d,M.frame,x,7.24,cz);}
 box(w+.6,.16,d+.6,cladding,cx,8.45,cz);for(let z=z0;z<=z1;z+=.55)box(w+.55,.035,.035,M.metal,cx,8.55,z);
 for(const z of [z0-.15,z1+.15])box(w+.5,.16,.18,M.frame,cx,8.34,z);
 for(const x of [x0+.22,x1-.22])for(const z of [z0+.22,z1-.22])rod([x,0,z],[x,8.3,z],.055,M.frame);
 // Regulation basketball court (28 × 15 m) within the larger school hall.
 const court={x:cx,z:cz,length:28,width:15};
 function segment(a,b,mat=line){const dx=b[0]-a[0],dz=b[1]-a[1],o=box(Math.hypot(dx,dz),.006,.055,mat,(a[0]+b[0])/2,.007,(a[1]+b[1])/2);o.rotation.y=-Math.atan2(dz,dx);}
 function circle(x,z,r,mat=line,start=0,end=Math.PI*2){for(let n=0;n<64;n++){const a=start+(end-start)*n/64,b=start+(end-start)*(n+1)/64;segment([x+Math.cos(a)*r,z+Math.sin(a)*r],[x+Math.cos(b)*r,z+Math.sin(b)*r],mat);}}
 const ax=cx-14,bx=cx+14,az=cz-7.5,bz=cz+7.5;
 for(const [a,b]of [[[ax,az],[bx,az]],[[bx,az],[bx,bz]],[[bx,bz],[ax,bz]],[[ax,bz],[ax,az]],[[cx,az],[cx,bz]]])segment(a,b);circle(cx,cz,1.8);
 for(const sign of [-1,1]){const baseline=cx+sign*14,free=baseline-sign*5.8;for(const z of [cz-2.45,cz+2.45])segment([baseline,z],[free,z]);segment([free,cz-2.45],[free,cz+2.45]);circle(free,cz,1.8,line);circle(baseline-sign*1.575,cz,6.75,blue,sign>0?Math.PI/2:-Math.PI/2,sign>0?Math.PI*1.5:Math.PI/2);
 // Basket support is outside the baseline, with a transparent real backboard.
 const support=baseline+sign*1.7;box(.5,1.6,.5,padding,support,.8,cz);rod([support,.2,cz],[support,4.1,cz],.075,M.frame);rod([support,4.1,cz],[baseline-sign*.5,4.1,cz],.065,M.frame);box(.045,1.05,1.8,M.windowGlass,baseline-sign*.45,3.58,cz);for(const z of [cz-.9,cz+.9])box(.05,1.12,.045,M.white,baseline-sign*.45,3.58,z);for(const y of [3.05,4.11])box(.05,.05,1.83,M.white,baseline-sign*.45,y,cz);
 const ring=new T.Mesh(new T.TorusGeometry(.225,.018,10,36),red);ring.rotation.x=Math.PI/2;ring.position.set(baseline-sign*.77,3.05,cz);root.add(ring);for(let n=0;n<12;n++){const a=n*Math.PI/6;rod([baseline-sign*.77+Math.cos(a)*.225,3.05,cz+Math.sin(a)*.225],[baseline-sign*.77+Math.cos(a+.2)*.14,2.65,cz+Math.sin(a+.2)*.14],.004,net);}solid(support-.3,support+.3,cz-.3,cz+.3,0,1.7,'gym-basket-support');
 // Handball goals at the ends of the multi-sport area, with netting.
 const gx=cx+sign*17.4,back=gx+sign*.8;for(const z of [cz-1.5,cz+1.5]){rod([gx,0,z],[gx,2,z],.04,M.white);rod([gx,2,z],[back,1.9,z],.025,M.frame);solid(gx-.06,gx+.06,z-.06,z+.06,0,2.05,'gym-goal-post');}rod([gx,2,cz-1.5],[gx,2,cz+1.5],.04,M.white);
 for(let n=0;n<=15;n++)rod([back,0,cz-1.5+n*.2],[back,1.9,cz-1.5+n*.2],.004,net);for(let n=0;n<=10;n++)rod([back,n*.19,cz-1.5],[back,n*.19,cz+1.5],.004,net);solid(back-.025,back+.025,cz-1.5,cz+1.5,0,1.95,'gym-goal-net');
 }
 // Volleyball lines remain subordinate to the basketball markings.
 for(const z of [cz-4.5,cz+4.5])segment([cx-9,z],[cx+9,z],red);for(const x of [cx-9,cx-3,cx+3,cx+9])segment([x,cz-4.5],[x,cz+4.5],red);
 for(const z of [z0+.16,z1-.16])box(w-.9,1.45,.09,padding,cx,.75,z);
 const benches=[];for(const z of [z0+1.15,z1-1.15])for(const x of [cx-8,cx,cx+8]){box(4,.075,.45,wood,x,.47,z);for(const dx of [-1.6,1.6]){box(.07,.44,.35,M.frame,x+dx,.22,z);}solid(x-2,x+2,z-.25,z+.25,0,.53,'gym-bench');benches.push({x,z});}
 for(const x of [cx-12,cx,cx+12])for(const z of [cz-8,cz+8]){box(2.1,.075,.34,M.frame,x,7.1,z);box(1.95,.02,.28,M.light,x,7.05,z);}
 // A roof over the entrance and wayfinding make the new route legible.
 box(1.6,.09,4.1,M.frame,x0-.68,2.97,Z(310));
 const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=192;const ctx=canvas.getContext('2d');ctx.fillStyle='#345662';ctx.fillRect(0,0,1024,192);ctx.fillStyle='#fff';ctx.textAlign='center';ctx.font='600 72px Arial';ctx.fillText('GYMNASE · COLLÈGE DOUGGY',512,118,970);const tex=new T.CanvasTexture(canvas);tex.colorSpace=T.SRGBColorSpace;const sign=new T.Mesh(new T.PlaneGeometry(4,.75),new T.MeshStandardMaterial({map:tex}));sign.position.set(x0-.14,3.8,Z(310));sign.rotation.y=-Math.PI/2;root.add(sign);
 for(const py of [278,342]){const zz=Z(py);box((2180-1810)*P.scale,.25,.15,stone,X((2180+1810)/2),.125,zz);solid(X(1810),X(2180),zz-.075,zz+.075,0,.26,'gym-path-edge');}
 const wayfinding=new T.Mesh(new T.PlaneGeometry(1.65,.34),new T.MeshStandardMaterial({map:new T.CanvasTexture((()=>{const c=document.createElement('canvas');c.width=768;c.height=160;const ctx=c.getContext('2d');ctx.fillStyle='#345662';ctx.fillRect(0,0,768,160);ctx.fillStyle='#fff';ctx.font='600 64px Arial';ctx.textAlign='center';ctx.fillText('GYMNASE →',384,105);return c;})()),roughness:.85}));wayfinding.material.map.colorSpace=T.SRGBColorSpace;wayfinding.position.set(X(1810),2.1,Z(282));wayfinding.rotation.y=-Math.PI/2;root.add(wayfinding);rod([X(1810),0,Z(282)],[X(1810),2.3,Z(282)],.028,M.frame);
 return{footprint,height,door,court,benches};
};

(function(root){
'use strict';
// Approved enlarged plan: identical room geometry in the drawing and the visit.
const room=(id,name,x,y,w,h,side,a,b,type='class')=>({id,name,x,y,w,h,door:{side,a,b},type});
const plan={scale:.045,storey:3.4,wall:.18,outline:[[50,50],[530,50],[530,370],[1380,370],[1380,670],[50,670]],court:{x:530,y:50,w:850,h:320},stairs:[{id:'A',x:420,y:65,w:100,h:85},{id:'B',x:650,y:420,w:90,h:100}],floors:[
 {name:'Rez-de-chaussée',rooms:[
 room('fr','Français',50,50,230,130,'right',100,140),room('de','Allemand',50,180,230,115,'right',215,255),room('staff','Salle des profs',50,295,230,145,'right',340,380),room('math','Mathématiques',50,440,230,110,'right',475,515),room('art','Arts plastiques',50,550,230,120,'right',590,630),room('tech','Technologie',380,550,220,120,'left',590,630),
 room('entry-a','Entrée A',410,160,120,85,'left',185,225,'entry'),room('girls','Toilettes des filles',410,245,120,62,'right',255,285,'toilet'),room('boys','Toilettes des garçons',410,307,120,63,'right',315,345,'toilet'),
 room('life','Vie scolaire',600,560,130,110,'top',642,686,'service'),room('cpe','Bureau de la CPE',730,560,130,110,'top',772,816,'service'),room('nurse','Infirmerie',860,560,140,110,'top',902,946,'service'),room('dining','Réfectoire',1000,370,380,300,'left',450,510,'dining')],hall:{x:600,y:370,w:400,h:300},openings:[{id:'entry-b',name:'Entrée B',axis:'x',fixed:370,a:800,b:865},{id:'entry-a-out',name:'Entrée A · cour',axis:'z',fixed:530,a:178,b:226},{id:'hall-passage',name:'Grand hall',axis:'z',fixed:600,a:430,b:475}]},
 {name:'Premier étage',rooms:[
 room('en','Anglais',50,50,230,130,'right',105,145),room('es','Espagnol',50,180,230,105,'right',225,265),room('music','Musique',50,285,230,145,'right',350,390),room('svt','SVT',50,430,230,120,'right',485,525),room('latin','Latin',50,550,230,120,'right',605,645),room('history','Histoire',380,550,220,120,'left',590,630),
 room('arrival-a','Arrivée A',410,160,120,85,'left',185,225,'entry'),room('cdi','CDI',1000,370,380,140,'left',420,465,'library'),room('secretary','Secrétariat',1000,570,125,100,'top',1040,1080,'service'),room('director','Bureau du directeur',1125,570,125,100,'top',1160,1200,'service'),room('study','Permanence',1250,510,130,160,'left',520,560,'study')],hall:{x:600,y:370,w:400,h:300},openings:[{id:'upper-passage',name:'Petit hall',axis:'z',fixed:600,a:500,b:545},{id:'office-passage',name:'Accès aux bureaux',axis:'z',fixed:1000,a:510,b:570}]}]};
// Projet de plan uniquement : indépendant du bâtiment jouable.
plan.outline=[[-80,50],[530,50],[530,370],[1380,370],[1380,670],[1000,670],[1000,830],[-80,830]];
for (const [level,ids] of [[0,['fr','de','staff','math','art']],[1,['en','es','music','svt','latin']]]) {
 const floor=plan.floors[level];
 ids.forEach((id,i)=>{const r=floor.rooms.find(r=>r.id===id);r.x=-80;r.y=50+i*156;r.w=360;r.h=156;r.door={side:'right',a:r.y+58,b:r.y+98};});
 const end=floor.rooms.find(r=>r.id===(level===0?'tech':'history'));
 end.h=830-end.y;end.door={side:'left',a:end.y+end.h/2-20,b:end.y+end.h/2+20};
}
const ground=plan.floors[0];
const oldStaff=ground.rooms.find(r=>r.id==='staff'),oldTech=ground.rooms.find(r=>r.id==='tech');
Object.assign(oldStaff,{id:'tech',name:'Technologie',type:'class'});
Object.assign(oldTech,{id:'staff',name:'Salle des profs',type:'service'});
for(const id of ['life','cpe','nurse']){const r=ground.rooms.find(r=>r.id===id);r.h=830-r.y;}
ground.hall.h=460;
Object.assign(ground.openings.find(o=>o.id==='hall-passage'),{a:500,b:540});

// Étape suivante : services du rez-de-chaussée et bureaux de l’étage.
ground.rooms=ground.rooms.filter(r=>!['life','cpe','nurse','girls','boys'].includes(r.id));
const staff=ground.rooms.find(r=>r.id==='staff');
Object.assign(staff,{y:665,h:165,door:{side:'left',a:727.5,b:767.5}});
const life=room('life','Vie scolaire',600,560,400,270,'top',778,822,'service');
life.polygon=[[600,560],[1000,560],[1000,830],[730,830],[730,665],[600,665]];life.label={x:850,y:697};
ground.rooms.push(life,
 room('cpe','Bureau de la CPE',600,665,130,165,'right',727.5,767.5,'service'),
 room('nurse','Infirmerie',380,550,220,115,'top',468,512,'service'),
 room('girls','Toilettes des filles',410,245,120,125,'right',287.5,327.5,'toilet'),
 room('boys','Toilettes des garçons',410,370,190,90,'top',550,590,'toilet'));
const upper=plan.floors[1];
const music=upper.rooms.find(r=>r.id==='music'),history=upper.rooms.find(r=>r.id==='history');
Object.assign(music,{id:'history',name:'Histoire'});Object.assign(history,{id:'music',name:'Musique'});
upper.rooms=upper.rooms.filter(r=>!['study','secretary','director'].includes(r.id));
upper.rooms.push(room('study','Permanence',600,670,400,160,'top',778,822,'study'),
 room('secretary','Secrétariat',1000,570,200,100,'top',1078,1122,'service'),
 room('director','Bureau du directeur',1200,510,180,160,'left',520,560,'service'));
// Fenêtres sur les façades réellement extérieures ; le CDI conserve sa baie sur cour.
plan.windows=[[],[]];
for(let level=0;level<2;level++){
 for(const r of plan.floors[level].rooms){
  const pts=r.polygon||[[r.x,r.y],[r.x+r.w,r.y],[r.x+r.w,r.y+r.h],[r.x,r.y+r.h]];
  for(let i=0;i<pts.length;i++){
   const a=pts[i],b=pts[(i+1)%pts.length],axis=a[1]===b[1]?'x':'z',fixed=axis==='x'?a[1]:a[0],lo=Math.min(axis==='x'?a[0]:a[1],axis==='x'?b[0]:b[1]),hi=Math.max(axis==='x'?a[0]:a[1],axis==='x'?b[0]:b[1]);
   const exterior=plan.outline.some((c,j)=>{const d=plan.outline[(j+1)%plan.outline.length];return axis==='x'?c[1]===d[1]&&fixed===c[1]&&lo>=Math.min(c[0],d[0])&&hi<=Math.max(c[0],d[0]):c[0]===d[0]&&fixed===c[0]&&lo>=Math.min(c[1],d[1])&&hi<=Math.max(c[1],d[1]);});
   if(!exterior||hi-lo<70||r.type==='entry')continue;
   const door=doorOf(r),gap=door.axis===axis&&door.fixed===fixed?door:null;
   const intervals=gap?[[lo+20,gap.a-16],[gap.b+16,hi-20]]:[[lo+25,hi-25]];
   for(const [start,end]of intervals){if(end-start<30)continue;const mid=(start+end)/2,width=r.id==='cdi'&&fixed===370?255:Math.min(end-start,100);plan.windows[level].push({room:r.id,axis,fixed,a:mid-width/2,b:mid+width/2});}
  }
 }
}
// L’infirmerie est intérieure : une vitre haute donne sur la circulation.
plan.windows[0].push({room:'nurse',axis:'x',fixed:550,a:400,b:445,interior:true});
// Fenêtres et moquette indiquées sur le plan de l’étage.
plan.windows[1].push(
 {room:'circulation-north',axis:'x',fixed:50,a:320,b:360},
 {room:'arrival-a',axis:'z',fixed:530,a:175,b:235},
 {room:'circulation-court',axis:'z',fixed:530,a:265,b:350},
 {room:'circulation-corner',axis:'x',fixed:370,a:535,b:575},
 {room:'hall-west',axis:'x',fixed:370,a:680,b:750},
 {room:'hall-east',axis:'x',fixed:370,a:850,b:940},
 {room:'circulation-south',axis:'x',fixed:830,a:320,b:350});
plan.floorZones=[[],[{id:'upper-carpet-circulation',kind:'carpet',color:0x648878,polygon:[[410,245],[530,245],[530,370],[600,370],[600,480],[410,480]]}]];


function doorOf(r){const horizontal=['top','bottom'].includes(r.door.side);return{id:r.id,name:r.name,axis:horizontal?'x':'z',fixed:r.door.side==='top'?r.y:r.door.side==='bottom'?r.y+r.h:r.door.side==='left'?r.x:r.x+r.w,a:r.door.a,b:r.door.b,room:r.id};}
function segments(level){const floor=plan.floors[level],groups=new Map();function add(axis,fixed,a,b){const key=axis+':'+fixed;if(!groups.has(key))groups.set(key,{axis,fixed,intervals:[]});groups.get(key).intervals.push([a,b]);}
 const points=plan.outline;for(let i=0;i<points.length;i++){const p=points[i],q=points[(i+1)%points.length];if(p[1]===q[1])add('x',p[1],Math.min(p[0],q[0]),Math.max(p[0],q[0]));else add('z',p[0],Math.min(p[1],q[1]),Math.max(p[1],q[1]));}
 function rect(r){const pts=r.polygon||[[r.x,r.y],[r.x+r.w,r.y],[r.x+r.w,r.y+r.h],[r.x,r.y+r.h]];for(let i=0;i<pts.length;i++){const p=pts[i],q=pts[(i+1)%pts.length];if(p[1]===q[1])add('x',p[1],Math.min(p[0],q[0]),Math.max(p[0],q[0]));else add('z',p[0],Math.min(p[1],q[1]),Math.max(p[1],q[1]));}}

 floor.rooms.forEach(rect);add('z',600,370,830);
 // Stair A is joined to the entry vestibule, through an unobstructed threshold.
 const stair=plan.stairs[0];add('z',410,50,160);
 const gaps=floor.rooms.map(doorOf).concat(floor.openings,{id:'stair-a',name:'Escalier A',axis:'x',fixed:160,a:425,b:515,passage:true});
 const walls=[];for(const group of groups.values()){const merged=[];for(const [a,b]of group.intervals.sort((u,v)=>u[0]-v[0])){const last=merged[merged.length-1];if(last&&a<=last[1])last[1]=Math.max(last[1],b);else merged.push([a,b]);}for(const [a,b]of merged){const cuts=[a,b,...plan.outline.filter(p=>(group.axis==='x'?p[1]:p[0])===group.fixed).map(p=>group.axis==='x'?p[0]:p[1]).filter(v=>v>a&&v<b)].sort((x,y)=>x-y);for(let i=0;i<cuts.length-1;i++){const lo=cuts[i],hi=cuts[i+1];if(hi>lo)walls.push({...group,a:lo,b:hi,intervals:undefined,gaps:gaps.filter(g=>g.axis===group.axis&&g.fixed===group.fixed&&g.a<hi&&g.b>lo)});}}}
 return{walls,gaps};}
function points(r){return r.polygon||[[r.x,r.y],[r.x+r.w,r.y],[r.x+r.w,r.y+r.h],[r.x,r.y+r.h]];}
function contains(pts,x,y){let inside=false;for(let i=0,j=pts.length-1;i<pts.length;j=i++){const a=pts[i],b=pts[j];if(a[0]===b[0]&&x===a[0]&&y>=Math.min(a[1],b[1])&&y<=Math.max(a[1],b[1])||a[1]===b[1]&&y===a[1]&&x>=Math.min(a[0],b[0])&&x<=Math.max(a[0],b[0]))return true;if((a[1]>y)!==(b[1]>y)&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])inside=!inside;}return inside;}
function ranges(pts,y){const xs=[];for(let i=0;i<pts.length;i++){const a=pts[i],b=pts[(i+1)%pts.length];if((a[1]>y)!==(b[1]>y))xs.push(a[0]+(b[0]-a[0])*(y-a[1])/(b[1]-a[1]));}xs.sort((a,b)=>a-b);const out=[];for(let i=0;i<xs.length;i+=2)out.push([xs[i],xs[i+1]]);return out;}
function rectangles(pts){const ys=[...new Set(pts.map(p=>p[1]))].sort((a,b)=>a-b);return ys.slice(0,-1).flatMap((y,i)=>ranges(pts,(y+ys[i+1])/2).map(([x,right])=>({x,y,w:right-x,h:ys[i+1]-y})));}
plan.points=points;plan.containsRoom=(r,x,y)=>contains(points(r),x,y);plan.contains=(x,y)=>contains(plan.outline,x,y);plan.ranges=y=>ranges(plan.outline,y);plan.rectangles=r=>rectangles(points(r));plan.footprint=()=>rectangles(plan.outline);
plan.doorOf=doorOf;plan.segments=segments;root.CAMPUS_PLAN=plan;if(typeof module!=='undefined')module.exports=plan;
})(typeof window!=='undefined'?window:globalThis);

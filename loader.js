(function(){
 const root=document.getElementById("loader");
 if(!root)return;
 const q=s=>root.querySelector(s);
 const stage=q("#ldStage"),countEl=q("#ldCount"),label=q("#ldLabel"),bar=q("#ldBar"),pbox=q("#ldParticles");
 const reduce=window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches;
 const TAU=Math.PI*2;

 /* ---------- foods ---------- */
 const FOODS=[
  {k:"burger",e:"🍔"},
  {k:"fries",e:"🍟"},
  {k:"pizza",e:"🍕",photo:(typeof PIZZA!=="undefined")?PIZZA:null},
  {k:"strawberry",e:"🍓"},
  {k:"orange",e:"🍊"},
  {k:"bread",e:"🍞"},
  {k:"drink",e:"🥤",rigid:true}
 ];

 /* ---------- counter digits (odometer) ---------- */
 const mk=()=>{
  const d=document.createElement("span");d.className="dg";
  const s=document.createElement("span");s.className="strip";
  for(let i=0;i<10;i++){const c=document.createElement("i");c.textContent=i;s.appendChild(c)}
  d.appendChild(s);return d;
 };
 const dH=mk(),dT=mk(),dO=mk();dH.classList.add("h");
 const sweep=document.createElement("span");sweep.className="ld-sweep";
 countEl.append(dH,dT,dO,sweep);
 const setDigit=(d,v)=>{d.firstChild.style.transform="translateY("+(-v*10)+"%)"};
 function setCount(n){
  setDigit(dH,n>=100?1:0);setDigit(dT,Math.floor(n/10)%10);setDigit(dO,n%10);
  dH.classList.toggle("on",n>=100);
  label.textContent="Loading ... "+String(n).padStart(2,"0")+"%";
  bar.style.transform="scaleX("+(n/100)+")";
  root.setAttribute("aria-valuenow",n);
 }

 /* ---------- real loading tasks ---------- */
 const withTimeout=(p,ms,v)=>Promise.race([p,new Promise(r=>setTimeout(()=>r(v),ms))]);
 const loadImg=src=>new Promise(r=>{
  if(!src)return r(null);
  const i=new Image();i.onload=()=>r(src);i.onerror=()=>r(null);i.src=src;
 });
 let done=0,forceDone=false;const tasks=[];
 const add=p=>{tasks.push(p);const inc=()=>{done++};p.then(inc,inc)};
 add(withTimeout(document.fonts&&document.fonts.ready?document.fonts.ready:Promise.resolve(),6000));
 add(withTimeout(document.readyState==="complete"?Promise.resolve():new Promise(r=>addEventListener("load",r,{once:true})),8000));
 FOODS.forEach(f=>{
  f.pngP=withTimeout(loadImg("images/loader/"+f.k+".png"),6000,null);
  f.photoP=f.photo?withTimeout(loadImg(f.photo),6000,null):Promise.resolve(null);
  add(Promise.all([f.pngP,f.photoP]));
 });
 const total=tasks.length;
 setTimeout(()=>{forceDone=true},9500);

 /* ---------- particles ---------- */
 for(let i=0;i<16;i++){
  const p=document.createElement("span");p.className="ld-p";
  const s=2+Math.random()*2.5;
  p.style.cssText="left:"+(Math.random()*100)+"%;top:"+(30+Math.random()*65)+"%;width:"+s+"px;height:"+s+"px;animation-duration:"+(9+Math.random()*9)+"s;animation-delay:-"+(Math.random()*14)+"s";
  pbox.appendChild(p);
 }

 /* ---------- physics world ---------- */
 let W=0,H=0,floor=0,size=80,g=1100,finishing=false,running=true;
 const items=[];
 function measure(){
  const r=stage.getBoundingClientRect();
  W=r.width;H=r.height;floor=H*0.84;size=Math.min(W*0.27,116);g=H*3.1;
  items.forEach(it=>{
   it.body.style.width=it.body.style.height=size+"px";
   it.sh.style.width=size*0.9+"px";it.sh.style.height=size*0.17+"px";
   const e=it.body.querySelector(".emo");if(e)e.style.fontSize=(size*0.82)+"px";
  });
 }

 if(!reduce){
  measure();
  FOODS.forEach((f,i)=>{
   const body=document.createElement("div");body.className="ld-body";
   const sh=document.createElement("div");sh.className="ld-shadow";
   stage.append(sh,body);
   const it={f,body,sh,state:"wait",wait:0.3+i*0.34,lane:-1,x:0,y:0,vx:0,vy:0,rx:0,ry:0,rz:0,wx:0,wy:0,wz:0,sc:1,alpha:0,rest:0,bounces:0,bq:-1,hidden:true,ready:false};
   items.push(it);
   Promise.all([f.pngP,f.photoP]).then(([png,photo])=>{
    body.innerHTML="";
    if(png){const im=new Image();im.src=png;im.alt="";im.draggable=false;body.appendChild(im)}
    else if(photo){const im=new Image();im.src=photo;im.alt="";im.draggable=false;im.className="round";body.appendChild(im)}
    else{const s=document.createElement("span");s.className="emo";s.textContent=f.e;body.appendChild(s)}
    it.ready=true;measure();
   });
  });
  addEventListener("resize",measure);
 }else{
  stage.style.display="none";
 }

 const airCount=()=>items.filter(o=>o.state==="fly").length;

 function launch(it){
  const used=items.filter(o=>o!==it&&o.state!=="wait").map(o=>o.lane);
  const lanes=[0,1,2,3,4].filter(l=>!used.includes(l));
  if(!lanes.length)return false;
  const lane=lanes[Math.floor(Math.random()*lanes.length)];
  it.lane=lane;
  const pad=size*0.65;
  it.x=pad+(W-2*pad)*(lane/4)+(Math.random()-.5)*size*0.3;
  it.y=floor;
  const rise=Math.min(floor-size*0.2,floor*(0.50+Math.random()*0.38));
  it.vy=-Math.sqrt(2*g*rise);
  it.vx=(Math.random()-.5)*W*0.12;
  const rig=it.f.rigid;
  it.wx=(Math.random()-.5)*(rig?0.8:4.2);
  it.wy=(Math.random()-.5)*(rig?0.8:5.0);
  it.wz=(Math.random()-.5)*(rig?0.9:3.0);
  it.rx=0;it.ry=0;it.rz=(Math.random()-.5)*0.2;
  it.sc=0.94+Math.random()*0.12;it.alpha=0;it.rest=0;it.bounces=0;
  it.state="fly";
  return true;
 }

 function step(it,dt){
  if(it.state==="wait"){
   it.wait-=dt;
   if(it.wait<=0&&it.ready&&!finishing){
    if(airCount()<3&&launch(it)){}else it.wait=0.15;
   }
   return;
  }
  if(it.state==="out"){
   it.alpha-=dt*2.2;
   if(it.alpha<=0){it.alpha=0;it.state="wait";it.wait=0.3+Math.random()*0.9;it.lane=-1}
   return;
  }
  it.alpha=Math.min(1,it.alpha+dt*7);
  if(it.state==="fly"){
   it.vy+=g*dt;
   it.vx*=Math.exp(-0.25*dt);it.vy*=Math.exp(-0.12*dt);
   it.x+=it.vx*dt;it.y+=it.vy*dt;
   it.rx+=it.wx*dt;it.ry+=it.wy*dt;it.rz+=it.wz*dt;
   if(it.f.rigid){
    const k=1-Math.exp(-2.5*dt);
    it.rx-=it.rx*k;it.ry-=it.ry*k;it.rz-=it.rz*k;
   }
   const lo=size*0.5,hi=W-size*0.5;
   if(it.x<lo){it.x=lo;it.vx=Math.abs(it.vx)*0.4}
   if(it.x>hi){it.x=hi;it.vx=-Math.abs(it.vx)*0.4}
   if(it.y>=floor&&it.vy>0){
    it.y=floor;
    if(it.vy>110&&it.bounces<3){
     it.vy=-it.vy*0.30;it.vx*=0.72;
     it.wx*=0.5;it.wy*=0.5;it.wz*=0.5;it.bounces++;
    }else{
     it.vy=0;it.state="rest";it.rest=0.8+Math.random()*0.9;
    }
   }
  }else if(it.state==="rest"){
   const d=Math.exp(-6*dt);
   it.vx*=d;it.x+=it.vx*dt;
   const k=1-Math.exp(-7*dt);
   ["rx","ry","rz"].forEach(a=>{const n=Math.round(it[a]/TAU)*TAU;it[a]+=(n-it[a])*k});
   it.rest-=dt;
   if(it.rest<=0)it.state="out";
  }
 }

 function draw(it){
  const b=it.body,s=it.sh;
  if(it.state==="wait"){
   if(!it.hidden){b.style.opacity=0;s.style.opacity=0;it.hidden=true}
   return;
  }
  it.hidden=false;
  const x=it.x-size/2,y=it.y-size;
  b.style.opacity=it.alpha.toFixed(2);
  b.style.transform="translate3d("+x.toFixed(1)+"px,"+y.toFixed(1)+"px,0) rotateX("+it.rx.toFixed(3)+"rad) rotateY("+it.ry.toFixed(3)+"rad) rotateZ("+it.rz.toFixed(3)+"rad) scale("+it.sc.toFixed(3)+")";
  const h=Math.max(0,floor-it.y),k=Math.max(0.3,1-h/(floor*0.9));
  s.style.opacity=(0.5*k*it.alpha).toFixed(2);
  s.style.transform="translate3d("+(it.x-size*0.45).toFixed(1)+"px,"+(floor-size*0.07).toFixed(1)+"px,0) scale("+(0.6+0.4*k).toFixed(2)+",1)";
  /* subtle motion blur at high speed */
  const sp=Math.hypot(it.vx,it.vy);
  const bl=Math.min(1.6,Math.max(0,(sp-Math.max(380,H*0.9))/900*1.8));
  const qb=Math.round(bl*2.5)/2.5;
  if(qb!==it.bq&&b.firstChild){
   it.bq=qb;
   b.firstChild.style.filter="drop-shadow(0 8px 10px rgba(0,0,0,.35))"+(qb?" blur("+qb+"px)":"");
  }
 }

 /* ---------- counter pacing (never skips a number) ---------- */
 let shown=1,acc=0,last=performance.now();
 setCount(1);
 const stepMs=n=>24+30*Math.pow(Math.abs(n-50)/50,2);

 function complete(){
  finishing=true;
  root.classList.add("complete");
  setTimeout(()=>settle(0),1100);
 }
 function settle(n){
  if(items.some(o=>o.state==="fly")&&n<12){setTimeout(()=>settle(n+1),150);return}
  exit();
 }
 function exit(){
  root.classList.add("done");
  setTimeout(()=>{
   window.__loaded=1;
   const h=document.getElementById("hero");
   if(h)h.classList.add("go");
  },280);
  setTimeout(()=>{running=false;root.remove()},1000);
 }

 function frame(now){
  if(!running)return;
  let dt=(now-last)/1000;last=now;dt=Math.min(dt,1/30);

  if(forceDone)done=total;
  const target=(done>=total)?100:Math.max(1,Math.min(99,Math.round(done/total*100)));
  acc+=dt*1000;
  if(shown<target){
   const ms=stepMs(shown);
   if(acc>=ms){shown++;acc=Math.min(acc-ms,ms);setCount(shown)}
  }else acc=0;
  if(shown>=100&&!finishing)complete();

  if(!reduce){
   stage.style.transform="translate3d("+(Math.sin(now/2000)*3).toFixed(2)+"px,"+(Math.cos(now/2500)*2).toFixed(2)+"px,0)";
   items.forEach(it=>{step(it,dt);draw(it)});
  }
  requestAnimationFrame(frame);
 }
 requestAnimationFrame(frame);
})();

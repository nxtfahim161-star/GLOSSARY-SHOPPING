(function(){
 const root=document.getElementById("loader");
 if(!root)return;
 const q=s=>root.querySelector(s);
 const countEl=q("#ldCount"),label=q("#ldLabel"),bar=q("#ldBar"),box=q("#ldPhotos"),cap=q("#ldCap");
 const reduce=window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches;

 /* ---------- real photographs (from data.js) ---------- */
 const ALL=(typeof P!=="undefined")?P:[];
 const SHOW=[3,4,9,1].map(id=>ALL.find(p=>p.id===id)).filter(Boolean);   /* classic burger, prawn noodles, pancakes, double burger */
 const missing=[];window.__missingPhotos=missing;

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
 let layer=-1;const layers=[];
 function showLayer(i){
  if(i===layer||!layers[i])return;
  layers.forEach((l,k)=>{if(k!==i)l.classList.remove("on")});
  layers[i].classList.add("on");layer=i;
  cap.textContent=SHOW[i].name;
 }
 function setCount(n){
  setDigit(dH,n>=100?1:0);setDigit(dT,Math.floor(n/10)%10);setDigit(dO,n%10);
  dH.classList.toggle("on",n>=100);
  label.textContent="Loading ... "+String(n).padStart(2,"0")+"%";
  bar.style.transform="scaleX("+(n/100)+")";
  root.setAttribute("aria-valuenow",n);
  showLayer(Math.min(SHOW.length-1,Math.floor((n-1)/(100/SHOW.length))));
 }

 /* ---------- real loading tasks: fonts, page load, every product photo ---------- */
 const withTimeout=(p,ms)=>Promise.race([p,new Promise(r=>setTimeout(r,ms))]);
 const loadImg=p=>new Promise(r=>{
  const i=new Image();
  i.onload=()=>r(i);
  i.onerror=()=>{missing.push(p.img);console.warn("Photo missing:",p.img);r(null)};
  i.src=p.img;
 });
 let done=0,forceDone=false;const tasks=[];
 const add=p=>{tasks.push(p);const inc=()=>{done++};p.then(inc,inc)};
 add(withTimeout(document.fonts&&document.fonts.ready?document.fonts.ready:Promise.resolve(),6000));
 add(withTimeout(document.readyState==="complete"?Promise.resolve():new Promise(r=>addEventListener("load",r,{once:true})),8000));
 const loaded={};
 ALL.forEach(p=>add(withTimeout(loadImg(p).then(i=>{loaded[p.id]=i}),8000)));
 const total=tasks.length;
 setTimeout(()=>{forceDone=true},9500);

 /* photo layers: use the already-loaded photo, or show an honest "missing" note */
 SHOW.forEach(p=>{
  const l=document.createElement("div");l.className="ld-ph";
  const im=new Image();im.src=p.img;im.alt=p.name;im.draggable=false;im.style.objectPosition=p.pos||"50% 50%";
  im.onerror=()=>{l.innerHTML="";const m=document.createElement("div");m.className="ld-miss";m.textContent="Photo missing: "+p.img;l.appendChild(m)};
  l.appendChild(im);box.appendChild(l);layers.push(l);
 });

 /* ---------- counter pacing (never skips a number) ---------- */
 let shown=1,acc=0,last=performance.now(),finishing=false,running=true;
 setCount(1);
 const stepMs=n=>24+30*Math.pow(Math.abs(n-50)/50,2);

 function complete(){
  finishing=true;
  root.classList.add("complete");
  setTimeout(exit,1300);
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
  requestAnimationFrame(frame);
 }
 requestAnimationFrame(frame);
})();
   

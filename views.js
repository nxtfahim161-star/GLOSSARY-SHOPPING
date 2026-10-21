let view="home",arg=null,timer=null,M=null;
const STEPS={
 delivery:["Order placed","Preparing","Rider picked up","On the way","Delivered"],
 pickup:["Order placed","Preparing","Ready for pickup"]
};

/* ---------- page transition: quick fade + slide ---------- */
function go(v,a){
 const el=$("#view");
 const swap=()=>{view=v;arg=a;clearInterval(timer);render();scrollTo(0,0)};
 if(REDUCE){swap();return}
 el.classList.add("leave");
 setTimeout(()=>{
  swap();
  el.classList.remove("leave");el.classList.add("enter");
  setTimeout(()=>el.classList.remove("enter"),480);
 },200);
}

/* ---------- staggered scroll reveal ---------- */
const io=new IntersectionObserver(es=>es.forEach(x=>{
 if(x.isIntersecting){
  x.target.classList.add("in");io.unobserve(x.target);
  setTimeout(()=>{x.target.style.transitionDelay=""},1100);
 }
}),{threshold:.08});
function observe(){
 const seen=new Map();
 $$(".rv:not(.in)").forEach(el=>{
  const p=el.parentNode,n=seen.get(p)||0;seen.set(p,n+1);
  el.style.transitionDelay=(Math.min(n,8)*60)+"ms";
  io.observe(el);
 });
}

/* ---------- builders ---------- */
const isFav=id=>S.favs.includes(id);
const feeLabel=s=>S.mode=="pickup"?"Pickup":(s.fee==0?"Free delivery":tk(LOCS[S.loc])+" delivery");
const shopFirst=s=>P.find(p=>p.shop==s.id);

function shopCard(s){
 return `<div class="shopc tilt rv" data-act="shop" data-id="${s.id}">
  <div class="shop-pic">${imgTag(shopFirst(s))}${s.offer?`<span class="badge">${s.offer}</span>`:""}
  <button class="heart ${isFav(s.id)?"on":""}" data-act="fav" data-id="${s.id}">♥</button></div>
  <h4>${s.name}</h4>
  <div class="meta">⭐ ${s.rate} • ${s.time} min • ${feeLabel(s)}</div>
  <div class="meta">Min ${tk(s.min)} • ${s.cat}</div></div>`;
}
function popCard(p){
 return `<div class="pcard" data-act="item" data-id="${p.id}"><div class="pic">${imgTag(p)}</div>
  <h4>${p.name}</h4><div class="brand">${shop(p.shop).name} • ⭐ ${p.rate}</div>
  <div class="price"><b>${tk(p.price)}</b><s>${tk(p.old)}</s></div>
  <button class="add" data-act="add" data-id="${p.id}">+</button></div>`;
}
function shopList(){
 const hit=s=>(s.name+s.cat+P.filter(p=>p.shop==s.id).map(p=>p.name).join(" ")).toLowerCase().includes(S.q);
 const L=SHOPS.filter(s=>(S.cat=="All"||s.cat==S.cat)&&hit(s)&&(!S.f.free||s.fee==0)&&(!S.f.top||s.rate>=4.5)
  &&(!S.f.offer||s.offer)&&(!S.f.fast||s.time<=30)&&(!S.f.fav||isFav(s.id)));
 if(S.sort=="rate")L.sort((a,b)=>b.rate-a.rate);
 if(S.sort=="time")L.sort((a,b)=>a.time-b.time);
 return L.length?L.map(shopCard).join(""):emptyHTML("🔎","No shops found","Try another category or clear the filters","Clear filters","reset");
}
function shopAreaHTML(){
 const cats=["All",...new Set(SHOPS.map(s=>s.cat))];
 const fl=[["free","Free delivery"],["top","Rating 4.5+"],["offer","Offers"],["fast","Under 30 min"],["fav","♥ Favorites"]];
 return `<div class="chips">${cats.map(c=>`<button class="chip ${S.cat==c?"on":""}" data-act="cat" data-v="${c}">${c=="All"?t("all"):c}</button>`).join("")}</div>
 <div class="chips">${fl.map(([k,l])=>`<button class="chip ${S.f[k]?"on":""}" data-act="flt" data-v="${k}">${l}</button>`).join("")}</div>
 <div class="bar"><h2>${t("near")} ${S.loc}</h2><select id="sort">
  <option value="">Recommended</option>
  <option value="rate" ${S.sort=="rate"?"selected":""}>Top rated</option>
  <option value="time" ${S.sort=="time"?"selected":""}>Fastest</option></select></div>
 <div class="shops">${shopList()}</div>`;
}
function skeletonHTML(){
 const card=`<div class="shopc sk-card"><div class="shop-pic sk"></div><div class="sk line"></div><div class="sk line s"></div></div>`;
 return `<div class="chips">${'<span class="sk sk-chip"></span>'.repeat(5)}</div>
 <div class="bar"><h2>${t("near")} ${S.loc}</h2></div>
 <div class="shops">${card.repeat(4)}</div>`;
}
function refreshShops(){
 if(view!="home")return;
 $("#shopArea").innerHTML=shopAreaHTML();observe();
}

/* hero: real photographs revealed with a mask, parallax moves the frame (not the food) */
function heroPh(id,cls,s,d){
 const p=prod(id);
 return `<figure class="px hp ${cls}" data-s="${s}" style="--d:${d}s"><div class="hp-in">${imgTag(p)}</div><figcaption>${p.name}</figcaption></figure>`;
}
function homeHTML(){
 const mq=["BURGERS","NOODLES & PASTA","BREAKFAST","COFFEE","DESSERTS","FAST DELIVERY"].map(x=>`<span>${x}</span>`).join("");
 const pop=P.slice().sort((a,b)=>b.rate-a.rate).slice(0,8).map(popCard).join("");
 const dust=Array.from({length:9},(_,i)=>`<i class="dust" style="left:${(i*37+11)%96}%;top:${(i*53+7)%90}%;width:${2+i%3}px;height:${2+i%3}px;animation-duration:${9+i%5*2}s;animation-delay:-${i*1.3}s"></i>`).join("");
 return `<section class="hero" id="hero"><div class="hero-text">
  <p class="tag">Fresh food • Fast delivery • Demo</p>
  <h1><span class="ln"><i>${t("hero1")}</i></span><span class="ln"><i class="hl">${t("hero2")}</i></span><span class="ln"><i>${t("hero3")}</i></span></h1>
  <div class="find"><input id="addr" placeholder="Enter your delivery area"><button data-act="find">${t("find")}</button></div></div>
  <div class="hero-art">${dust}
   <span class="px amb" data-s="0.06"></span>
   ${heroPh(3,"main","0.05","0.1")}
   ${heroPh(4,"s1","-0.04","0.35")}
   ${heroPh(9,"s2","0.07","0.5")}
  </div></section>
  <div class="mq-wrap"><div class="marquee" id="mq"><div class="track-m">${mq}${mq}${mq}${mq}</div></div></div>
  <main><div id="shopArea"></div>
  <h2 class="sec rv">${t("pop")}</h2><div class="hscroll" id="pop">${pop}</div>
  <div class="plus rv"><div><h3>GASS Plus ${S.plus?"✅":""}</h3>
   <p>Free delivery on orders ${tk(350)}+. Pickup is always 10% off. (Demo subscription)</p></div>
   <button class="primary" data-act="plus">${S.plus?"Active":"Join "+tk(99)+"/mo"}</button></div></main>`;
}
function initHome(){
 if(!window.__seen&&!REDUCE){
  window.__seen=1;
  $("#shopArea").innerHTML=skeletonHTML();
  setTimeout(()=>{if(view=="home"){$("#shopArea").innerHTML=shopAreaHTML();observe()}},650);
 }else{
  window.__seen=1;
  $("#shopArea").innerHTML=shopAreaHTML();
 }
 if(window.__loaded)setTimeout(()=>{const h=$("#hero");if(h)h.classList.add("go")},60);
 const el=$("#pop");let d=false,x=0,sl=0;
 el.onpointerdown=e=>{d=true;x=e.clientX;sl=el.scrollLeft};
 addEventListener("pointerup",()=>d=false);
 el.onpointermove=e=>{if(d&&e.pointerType=="mouse")el.scrollLeft=sl-(e.clientX-x)};
 schedule();
}

function shopHTML(){
 const s=shop(arg),items=P.filter(p=>p.shop==s.id);
 return `<section class="shop-head"><button class="back" data-act="go" data-v="home">← Back</button>
  <div class="sh-e">${imgTag(items[0])}</div>
  <div><h2>${s.name}</h2><p>⭐ ${s.rate} • ${s.time} min • Min ${tk(s.min)} • ${feeLabel(s)}</p>
  ${s.offer?`<span class="badge st">${s.offer}</span>`:""}</div>
  <button class="heart ${isFav(s.id)?"on":""}" data-act="fav" data-id="${s.id}">♥</button></section>
  <main><div class="menu">${items.map(p=>`<div class="mrow rv" data-act="item" data-id="${p.id}">
   <div class="e">${imgTag(p)}</div><div class="m"><b>${p.name}</b><br><small>${p.desc}</small>
   <div class="price"><b>${tk(p.price)}</b><s>${tk(p.old)}</s></div></div>
   <button class="add" data-act="add" data-id="${p.id}">+</button></div>`).join("")}</div></main>`;
}

function ordersHTML(){
 if(!S.orders.length)return `<main><h2>My orders</h2>${emptyHTML("🧾","No orders yet","Your placed orders will show up here","Order something","browse")}</main>`;
 return `<main><h2>My orders</h2><br>${S.orders.map((o,i)=>`<div class="ocard rv">
  <div class="row"><b>Order #${String(o.id).slice(-5)}</b><span>${o.date}</span></div>
  <div class="row"><span>${o.items.map(x=>prod(x.id).name+" × "+x.qty).join(", ")}</span></div>
  <div class="row"><span>${o.mode=="delivery"?"Delivery • "+o.loc:"Pickup"} • ${o.pay}</span><b>${tk(o.tt.total)}</b></div>
  <div class="btns"><button class="mini dark" data-act="track" data-id="${o.id}">Track</button>
  <button class="mini" data-act="reorder" data-v="${i}">Reorder</button></div></div>`).join("")}</main>`;
}

function trackHTML(o){
 const st=STEPS[o.mode];
 return `<main><button class="back" data-act="go" data-v="orders">← My orders</button>
  <h2>Order #${String(o.id).slice(-5)}</h2>
  <p class="meta">${o.mode=="delivery"?"Delivering to "+o.loc:"Pickup order"} • ${o.pay}</p>
  <div class="road"><div class="bar-f" id="barf"></div><span class="rider" id="rider">${o.mode=="delivery"?"🛵":"🛍️"}</span></div>
  <ol class="steps" id="steps">${st.map(s=>`<li>${s}</li>`).join("")}</ol>
  <div class="sumbox">${o.items.map(x=>`<div class="row"><span>${prod(x.id).name} × ${x.qty}</span><b>${tk(prod(x.id).price*x.qty)}</b></div>`).join("")}
  <div class="row tot"><span>Total</span><b>${tk(o.tt.total)}</b></div></div></main>`;
}
function runTrack(o){
 const st=STEPS[o.mode];
 const upd=()=>{
  $$("#steps li").forEach((li,i)=>{li.classList.toggle("done",i<=o.step);li.classList.toggle("cur",i==o.step&&o.step<st.length-1)});
  const p=o.step/(st.length-1)*88;
  $("#rider").style.left=p+"%";$("#barf").style.width=p+"%";
 };
 upd();
 timer=setInterval(()=>{
  if(o.step<st.length-1){o.step++;sv("g_orders",S.orders);upd();buzz(8)}else clearInterval(timer);
 },2500);
}

function render(){
 const v=$("#view");
 if(view=="home"){v.innerHTML=homeHTML();initHome()}
 else if(view=="shop")v.innerHTML=shopHTML();
 else if(view=="orders")v.innerHTML=ordersHTML();
 else if(view=="track"){
  const o=S.orders.find(x=>x.id==arg);
  if(!o){view="home";return render()}
  v.innerHTML=trackHTML(o);runTrack(o);
 }
 observe();schedule();
}

function setNav(){
 $("#mDel").classList.toggle("on",S.mode=="delivery");
 $("#mPick").classList.toggle("on",S.mode=="pickup");
 $("#mDel").textContent=t("delivery");$("#mPick").textContent=t("pickup");
 $("#locText").textContent=S.loc;
 $("#langBtn").textContent=S.lang=="en"?"বাং":"EN";
 $("#userBtn").textContent=S.user?"👤 "+S.user.name.split(" ")[0]:"👤 Login";
 $("#hapBtn").textContent="📳 Haptics: "+(S.hap?"On":"Off");
 $("#locList").innerHTML=Object.entries(LOCS).map(([n,f])=>`<button class="${n==S.loc?"on":""}" data-act="setloc" data-v="${n}"><span>${n}</span><span>Delivery ${tk(f)}</span></button>`).join("");
}

/* ---------- item modal (bottom sheet on phones) ---------- */
function openItem(id){M={id,opt:prod(id).opts[0],qty:1};drawItem();$("#modal").classList.add("on");buzz(6)}
function drawItem(){
 const p=prod(M.id);
 $("#modal").innerHTML=`<div class="box"><button class="x" data-act="close" data-v="modal">✕</button>
  <div class="big-pic">${imgTag(p)}</div><h3>${p.name}</h3>
  <div class="brand">✔ ${shop(p.shop).name} • ⭐ ${p.rate}</div><p class="meta">${p.desc}</p>
  <div class="opts">${p.opts.map(o=>`<button class="opt ${o==M.opt?"on":""}" data-act="mopt" data-v="${o}">${o}</button>`).join("")}</div>
  <div class="price"><b>${tk(p.price)}</b><s>${tk(p.old)}</s></div>
  <div class="m-foot"><div class="qty"><button data-act="mq" data-v="-1">−</button><b>${M.qty}</b><button data-act="mq" data-v="1">+</button></div>
  <button class="primary" data-act="madd">Add to cart</button></div></div>`;
}

/* ---------- checkout + success ---------- */
function showOk(cb){
 const ok=$("#okSheet");ok.classList.add("on");buzz([10,50,20]);
 setTimeout(()=>{ok.classList.remove("on");cb()},REDUCE?500:1600);
}
function checkout(){
 const items=Object.values(S.cart);
 if(!items.length)return toast("Cart is empty");
 if(!S.user){$("#loginModal").classList.add("on");return}
 const o={id:Date.now(),items:items.map(i=>({...i})),tt:totals(),mode:S.mode,loc:S.loc,pay:S.pay,note:S.note,
  date:new Date().toLocaleString(),step:0};
 S.orders.unshift(o);sv("g_orders",S.orders);
 S.cart={};S.voucher=null;S.note="";saveCart();renderCart();openCart(false);
 confetti();
 showOk(()=>go("track",o.id));
}
function login(){
 const n=$("#lname").value.trim(),ph=$("#lphone").value.trim(),otp=$("#lotp").value.trim();
 if(!n||ph.length<6)return toast("Enter your name and phone");
 if(otp!=="1234"){buzz([12,40,12]);return toast("Wrong OTP (demo code is 1234)")}
 S.user={name:n,phone:ph};sv("g_user",S.user);
 $("#loginModal").classList.remove("on");setNav();toast("Welcome, "+n+" 👋");
 if(count())checkout();
}

/* ---------- events ---------- */
document.addEventListener("click",e=>{
 if(e.target.classList&&e.target.classList.contains("modal")){e.target.classList.remove("on");return}
 const el=e.target.closest("[data-act]");if(!el)return;
 if(el.tagName=="A")e.preventDefault();
 const a=el.dataset.act,id=el.dataset.id,v=el.dataset.v;
 switch(a){
  case "go":go(v);break;
  case "shop":go("shop",id);break;
  case "track":go("track",+id);break;
  case "browse":openCart(false);if(view!="home")go("home");else scrollTo({top:0,behavior:"smooth"});break;
  case "reset":S.cat="All";S.q="";S.f={};S.sort="";$("#search").value="";refreshShops();break;
  case "hap":S.hap=!S.hap;sv("g_hap",S.hap);setNav();if(S.hap)buzz(12);break;
  case "fav":
   S.favs=isFav(id)?S.favs.filter(x=>x!=id):[...S.favs,id];sv("g_favs",S.favs);
   el.classList.remove("on");void el.offsetWidth;el.classList.toggle("on",isFav(id));buzz(8);
   if(S.f.fav)refreshShops();
   break;
  case "cat":S.cat=v;refreshShops();buzz(5);break;
  case "flt":S.f[v]=S.f[v]?0:1;refreshShops();buzz(5);break;
  case "item":openItem(+id);break;
  case "add":addToCart(+id,prod(+id).opts[0],1,el);break;
  case "mopt":M.opt=v;drawItem();buzz(5);break;
  case "mq":M.qty=Math.max(1,M.qty+ +v);drawItem();buzz(5);break;
  case "madd":addToCart(M.id,M.opt,M.qty,el);$("#modal").classList.remove("on");break;
  case "close":$("#"+v).classList.remove("on");break;
  case "q":cartQty(el.dataset.k,+v);break;
  case "closecart":openCart(false);break;
  case "mode":S.mode=v;sv("g_mode",v);setNav();renderCart();if(view=="home")refreshShops();buzz(6);break;
  case "loc":$("#locModal").classList.add("on");break;
  case "setloc":
   S.loc=v;sv("g_loc",v);setNav();renderCart();refreshShops();
   $("#locModal").classList.remove("on");toast("Location: "+v);buzz(8);break;
  case "find":{
   const q=($("#addr").value||"").trim().toLowerCase();
   const m=Object.keys(LOCS).find(n=>n.toLowerCase().includes(q));
   if(q&&m){S.loc=m;sv("g_loc",m);setNav();renderCart();refreshShops();toast("Delivering to "+m+" 🚀")}
   else toast("Area not found, pick from the location menu");
   $("#shopArea").scrollIntoView({behavior:"smooth"});break}
  case "lang":S.lang=S.lang=="en"?"bn":"en";sv("g_lang",S.lang);setNav();renderCart();render();break;
  case "user":
   if(S.user){S.user=null;sv("g_user",null);setNav();toast("Logged out")}
   else $("#loginModal").classList.add("on");break;
  case "login":login();break;
  case "plus":S.plus=!S.plus;sv("g_plus",S.plus);renderCart();render();toast(S.plus?"GASS Plus activated ✨":"GASS Plus cancelled");buzz(10);break;
  case "voucher":applyVoucher();break;
  case "tip":S.tip=+v;renderCart();buzz(5);break;
  case "pay":S.pay=v;renderCart();buzz(5);break;
  case "checkout":checkout();break;
  case "reorder":{
   S.orders[+v].items.forEach(i=>{const k=i.id+"|"+i.opt;S.cart[k]=S.cart[k]||{id:i.id,opt:i.opt,qty:0};S.cart[k].qty+=i.qty});
   saveCart();renderCart();openCart(true);break}
 }
});
document.addEventListener("change",e=>{if(e.target.id=="sort"){S.sort=e.target.value;refreshShops()}});
document.addEventListener("input",e=>{if(e.target.id=="note")S.note=e.target.value});
$("#search").oninput=e=>{
 S.q=e.target.value.toLowerCase().trim();
 if(view!="home"){view="home";render()}else refreshShops();
};
$("#cartBtn").onclick=()=>openCart(true);
$("#overlay").onclick=()=>openCart(false);

/* ---------- motion: parallax, card depth, marquee (one rAF-throttled loop) ---------- */
let ptX=0,ptY=0,ticking=false,lastY=scrollY,lastTilt=null,skT=null;
function schedule(){if(!ticking){ticking=true;requestAnimationFrame(update)}}
function update(){
 ticking=false;
 const y=scrollY,vh=innerHeight;
 const nav=$(".nav");if(nav)nav.classList.toggle("scrolled",y>8);
 if(REDUCE)return;

 const hero=$("#hero");
 if(hero){
  const hh=hero.offsetHeight;
  if(y<hh+60){
   $$("#hero .px").forEach(el=>{
    const s=+el.dataset.s;
    el.style.transform="translate3d("+(ptX*s).toFixed(1)+"px,"+(ptY*s+y*Math.abs(s)*2.4).toFixed(1)+"px,0)";
   });
   const tx=hero.querySelector(".hero-text");
   if(tx){tx.style.transform="translate3d(0,"+(y*0.16).toFixed(1)+"px,0)";tx.style.opacity=Math.max(0,1-y/(hh*0.85)).toFixed(2)}
  }
 }

 const m=$("#mq");
 if(m){
  const v=Math.max(-10,Math.min(10,(y-lastY)*0.35));
  m.style.transform="skewX("+(-v).toFixed(2)+"deg)";
  clearTimeout(skT);skT=setTimeout(()=>{m.style.transform=""},140);
 }
 lastY=y;

 $$(".shopc").forEach(card=>{
  const r=card.getBoundingClientRect();
  if(r.bottom<0||r.top>vh)return;
  const img=card.querySelector(".ph");
  if(img)img.style.setProperty("--py",(((r.top+r.height/2-vh/2)/vh)*-14).toFixed(1)+"px");
 });
}
addEventListener("scroll",schedule,{passive:true});
document.addEventListener("mousemove",e=>{
 const g=$("#glow");g.style.left=e.clientX+"px";g.style.top=e.clientY+"px";
 ptX=e.clientX-innerWidth/2;ptY=e.clientY-innerHeight/2;
 const el=e.target.closest&&e.target.closest(".tilt");
 if(lastTilt&&lastTilt!==el)lastTilt.style.transform="";
 if(el&&!REDUCE){
  const r=el.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;
  el.style.transform="perspective(700px) rotateY("+(x*8)+"deg) rotateX("+(-y*8)+"deg) translateY(-4px)";
 }
 lastTilt=el;
 schedule();
});

setNav();renderCart();render();
                                   

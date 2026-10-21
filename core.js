const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const ld=(k,d)=>{try{return JSON.parse(localStorage.getItem(k))??d}catch{return d}};
const sv=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch{}};
const REDUCE=!!(window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches);

const S={
 cart:ld("g_cart",{}),loc:ld("g_loc","Gulshan"),mode:ld("g_mode","delivery"),lang:ld("g_lang","en"),
 favs:ld("g_favs",[]),orders:ld("g_orders",[]),user:ld("g_user",null),plus:ld("g_plus",false),hap:ld("g_hap",true),
 voucher:null,tip:0,pay:"bKash",note:"",cat:"All",q:"",sort:"",f:{}
};

const T={
 en:{hero1:"Hungry?",hero2:"Real food,",hero3:"fast to your door.",find:"Find shops",near:"Shops near",pop:"Popular right now",
  cart:"Your cart",sub:"Subtotal",fee:"Delivery",disc:"Discount",tip:"Rider tip",total:"Total",
  checkout:"Place order",delivery:"Delivery",pickup:"Pickup",all:"All"},
 bn:{hero1:"ক্ষুধা পেয়েছে?",hero2:"আসল খাবার,",hero3:"দ্রুত আপনার দরজায়।",find:"দোকান খুঁজুন",near:"কাছের দোকান",pop:"এখন জনপ্রিয়",
  cart:"আপনার কার্ট",sub:"সাবটোটাল",fee:"ডেলিভারি",disc:"ছাড়",tip:"রাইডার টিপ",total:"মোট",
  checkout:"অর্ডার করুন",delivery:"ডেলিভারি",pickup:"পিকআপ",all:"সব"}
};
const t=k=>(T[S.lang]&&T[S.lang][k])||k;
const tk=n=>"৳"+n.toLocaleString("en-IN");
const prod=id=>P.find(p=>p.id==id);
const shop=id=>SHOPS.find(s=>s.id==id);
const count=()=>Object.values(S.cart).reduce((a,b)=>a+b.qty,0);
const saveCart=()=>sv("g_cart",S.cart);

/* subtle haptics (can be switched off in the footer) */
function buzz(p){try{if(S.hap&&!REDUCE&&navigator.vibrate)navigator.vibrate(p)}catch{}}

/* photo: skeleton while loading, soft fade-in. If the file is missing we show a labelled box
   (never a different picture, never an emoji). */
function imgMiss(img){
 const w=img.parentNode;w.classList.add("pl");
 w.innerHTML="";const m=document.createElement("span");m.className="miss";
 const b=document.createElement("b");b.textContent="Photo missing";
 const s=document.createElement("small");s.textContent=img.getAttribute("data-src")||"";
 m.append(b,s);w.appendChild(m);
}
function imgTag(p){
 if(!p)return "";
 const src=p.img||"";
 return `<span class="phw"><img class="ph" src="${src}" data-src="${src}" alt="${p.name}" style="object-position:${p.pos||"50% 50%"}" loading="lazy" decoding="async" onload="this.classList.add('in');this.parentNode.classList.add('pl')" onerror="imgMiss(this)"></span>`;
}

function emptyHTML(icon,title,sub,label,act){
 return `<div class="empty"><span class="ei">${icon}</span><b>${title}</b><p>${sub}</p>${label?`<button class="mini" data-act="${act}">${label}</button>`:""}</div>`;
}

function toast(m){
 const el=$("#toast");el.textContent=m;el.classList.add("on");
 clearTimeout(toast.t);toast.t=setTimeout(()=>el.classList.remove("on"),2400);
}

function tween(el,from,to,ms){
 if(!el)return;
 if(REDUCE||from===to){el.textContent=tk(to);return}
 const t0=performance.now();
 (function f(n){
  const k=Math.min(1,(n-t0)/ms),e=1-Math.pow(1-k,3);
  el.textContent=tk(Math.round(from+(to-from)*e));
  if(k<1)requestAnimationFrame(f);
 })(t0);
}

function totals(){
 const items=Object.values(S.cart);
 const sub=items.reduce((a,i)=>a+prod(i.id).price*i.qty,0);
 let fee=0,disc=0;
 if(S.mode=="delivery"&&items.length){
  const ids=[...new Set(items.map(i=>prod(i.id).shop))];
  fee=ids.reduce((a,id)=>a+(shop(id).fee==0?0:LOCS[S.loc]),0);
  if(S.plus&&sub>=350)fee=0;
 }
 if(S.mode=="pickup")disc+=Math.round(sub*0.1);
 if(S.voucher&&VOUCHERS[S.voucher]){
  const v=VOUCHERS[S.voucher];
  if(sub>=v.min){
   if(v.type=="flat")disc+=v.val;
   if(v.type=="pct")disc+=Math.round(sub*v.val/100);
   if(v.type=="free")fee=0;
  }
 }
 const tip=(S.mode=="delivery"&&items.length)?S.tip:0;
 return {sub,fee,disc,tip,total:Math.max(0,sub+fee+tip-disc)};
}

function addToCart(id,opt,qty,from){
 const k=id+"|"+opt;
 S.cart[k]=S.cart[k]||{id,opt,qty:0};
 S.cart[k].qty+=qty;
 saveCart();renderCart();buzz(8);
 if(from)fly(from,prod(id));
 toast("Added to cart ✅");
}
function cartQty(k,d){
 if(!S.cart[k])return;
 S.cart[k].qty+=d;
 if(S.cart[k].qty<=0)delete S.cart[k];
 saveCart();renderCart();buzz(6);
}

let lastTotal=0;
function renderCart(){
 const items=Object.entries(S.cart), tt=totals();
 $("#cartCount").textContent=count();
 $("#cartTitle").textContent=t("cart");
 if(!items.length){
  $("#cartBody").innerHTML=emptyHTML("🛒","Your cart is empty","Add something tasty to get started","Browse shops","browse");
  $("#cartFoot").innerHTML="";
  lastTotal=0;
  return;
 }
 $("#cartBody").innerHTML=items.map(([k,i],n)=>{const p=prod(i.id);
  return `<div class="item" style="--i:${n}"><div class="e">${imgTag(p)}</div><div class="m"><b>${p.name}</b><br><small>${i.opt} • ${tk(p.price)}</small></div>
  <div class="qty"><button data-act="q" data-k="${k}" data-v="-1">−</button><b>${i.qty}</b><button data-act="q" data-k="${k}" data-v="1">+</button></div></div>`}).join("")+
 `<div class="lbl">Special instructions</div>
  <textarea id="note" placeholder="e.g. no onions, extra sauce">${S.note}</textarea>
  <div class="lbl">Voucher</div>
  <div class="vrow" id="vrow"><input id="vin" placeholder="WELCOME50 / GASS10 / FREEDEL" value="${S.voucher||""}"><button data-act="voucher">Apply</button></div>
  ${S.mode=="delivery"?`<div class="lbl">${t("tip")}</div><div class="chipsr">${[0,20,50,100].map(v=>`<button class="mini ${S.tip==v?"on":""}" data-act="tip" data-v="${v}">${tk(v)}</button>`).join("")}</div>`:""}
  <div class="lbl">Payment</div>
  <div class="chipsr">${["bKash","Nagad","Card","Cash"].map(p=>`<button class="mini ${S.pay==p?"on":""}" data-act="pay" data-v="${p}">${p}</button>`).join("")}</div>`;
 $("#cartFoot").innerHTML=`
  <div class="row"><span>${t("sub")}</span><b>${tk(tt.sub)}</b></div>
  <div class="row"><span>${S.mode=="delivery"?t("fee")+" ("+S.loc+")":t("pickup")}</span><b>${tk(tt.fee)}</b></div>
  ${tt.tip?`<div class="row"><span>${t("tip")}</span><b>${tk(tt.tip)}</b></div>`:""}
  ${tt.disc?`<div class="row"><span>${t("disc")}</span><b>−${tk(tt.disc)}</b></div>`:""}
  <div class="row tot"><span>${t("total")}</span><b id="totV">${tk(lastTotal)}</b></div>
  <button class="primary" data-act="checkout">${t("checkout")}</button>`;
 tween($("#totV"),lastTotal,tt.total,380);
 lastTotal=tt.total;
}

function applyVoucher(){
 const code=($("#vin").value||"").trim().toUpperCase();
 const bad=m=>{toast(m);buzz([12,40,12]);const r=$("#vrow");if(r){r.classList.remove("shake");void r.offsetWidth;r.classList.add("shake")}};
 if(!code){S.voucher=null;renderCart();return}
 const v=VOUCHERS[code],tt=totals();
 if(!v)return bad("Invalid voucher code");
 if(tt.sub<v.min)return bad("Minimum order "+tk(v.min)+" for this voucher");
 S.voucher=code;renderCart();buzz(10);toast("Voucher applied 🎟️");
}

function openCart(on){
 const d=$("#drawer");
 d.classList.toggle("on",on);
 $("#overlay").classList.toggle("on",on);
 if(on&&!REDUCE){d.classList.add("anim");clearTimeout(openCart.t);openCart.t=setTimeout(()=>d.classList.remove("anim"),900)}
}

/* the real product photo flies into the cart */
function fly(from,p){
 const a=from.getBoundingClientRect(),b=$("#cartBtn").getBoundingClientRect();
 const e=document.createElement("div");e.className="fly";e.innerHTML=imgTag(p);
 e.style.left=a.left+a.width/2-23+"px";e.style.top=a.top+a.height/2-23+"px";document.body.appendChild(e);
 const dx=b.left+b.width/2-(a.left+a.width/2),dy=b.top+b.height/2-(a.top+a.height/2);
 const done=()=>{e.remove();const c=$("#cartBtn");c.classList.remove("bump");void c.offsetWidth;c.classList.add("bump")};
 if(REDUCE){done();return}
 e.animate([
  {transform:"translate(0,0) scale(1)",opacity:1},
  {transform:`translate(${dx*0.45}px,${Math.min(dy,0)-70}px) scale(1.15)`,opacity:1,offset:.4},
  {transform:`translate(${dx}px,${dy}px) scale(.35)`,opacity:.3}
 ],{duration:760,easing:"cubic-bezier(.45,.05,.55,.95)"}).onfinish=done;
}

function confetti(){
 if(REDUCE)return;
 const em=["🎉","✨","⭐","🎊"];
 for(let i=0;i<30;i++){
  const s=document.createElement("span");s.className="conf";s.textContent=em[i%em.length];
  s.style.left=Math.random()*95+"vw";document.body.appendChild(s);
  s.animate([{transform:"translateY(0) rotate(0)"},{transform:`translateY(110vh) rotate(${Math.random()*720}deg)`}],
   {duration:1600+Math.random()*1400,easing:"ease-in"}).onfinish=()=>s.remove();
 }
   }
                              

const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const ld=(k,d)=>{try{return JSON.parse(localStorage.getItem(k))??d}catch{return d}};
const sv=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch{}};

const S={
 cart:ld("g_cart",{}),loc:ld("g_loc","Gulshan"),mode:ld("g_mode","delivery"),lang:ld("g_lang","en"),
 favs:ld("g_favs",[]),orders:ld("g_orders",[]),user:ld("g_user",null),plus:ld("g_plus",false),
 voucher:null,tip:0,pay:"bKash",note:"",cat:"All",q:"",sort:"",f:{}
};

const T={
 en:{hero1:"Hungry?",hero2:"Out of power?",hero3:"We deliver both.",find:"Find shops",near:"Shops near",pop:"Popular right now",
  cart:"Your cart",empty:"Your cart is empty 🛒",sub:"Subtotal",fee:"Delivery",disc:"Discount",tip:"Rider tip",total:"Total",
  checkout:"Place order",delivery:"Delivery",pickup:"Pickup",all:"All"},
 bn:{hero1:"ক্ষুধা পেয়েছে?",hero2:"ব্যাটারি শেষ?",hero3:"দুটোই পৌঁছে দেব।",find:"দোকান খুঁজুন",near:"কাছের দোকান",pop:"এখন জনপ্রিয়",
  cart:"আপনার কার্ট",empty:"কার্ট খালি 🛒",sub:"সাবটোটাল",fee:"ডেলিভারি",disc:"ছাড়",tip:"রাইডার টিপ",total:"মোট",
  checkout:"অর্ডার করুন",delivery:"ডেলিভারি",pickup:"পিকআপ",all:"সব"}
};
const t=k=>(T[S.lang]&&T[S.lang][k])||k;
const tk=n=>"৳"+n.toLocaleString("en-IN");
const prod=id=>P.find(p=>p.id==id);
const shop=id=>SHOPS.find(s=>s.id==id);
const count=()=>Object.values(S.cart).reduce((a,b)=>a+b.qty,0);
const saveCart=()=>sv("g_cart",S.cart);

function toast(m){
 const el=$("#toast");el.textContent=m;el.classList.add("on");
 clearTimeout(toast.t);toast.t=setTimeout(()=>el.classList.remove("on"),2400);
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
 saveCart();renderCart();
 if(from)fly(from,prod(id).e);
 toast("Added to cart ✅");
}
function cartQty(k,d){
 if(!S.cart[k])return;
 S.cart[k].qty+=d;
 if(S.cart[k].qty<=0)delete S.cart[k];
 saveCart();renderCart();
}

function renderCart(){
 const items=Object.entries(S.cart), tt=totals();
 $("#cartCount").textContent=count();
 $("#cartTitle").textContent=t("cart");
 if(!items.length){
  $("#cartBody").innerHTML=`<div class="empty">${t("empty")}</div>`;
  $("#cartFoot").innerHTML="";
  return;
 }
 $("#cartBody").innerHTML=items.map(([k,i])=>{const p=prod(i.id);
  return `<div class="item"><div class="e">${p.e}</div><div class="m"><b>${p.name}</b><br><small>${i.opt} • ${tk(p.price)}</small></div>
  <div class="qty"><button data-act="q" data-k="${k}" data-v="-1">−</button><b>${i.qty}</b><button data-act="q" data-k="${k}" data-v="1">+</button></div></div>`}).join("")+
 `<div class="lbl">Special instructions</div>
  <textarea id="note" placeholder="e.g. no onions, extra sauce">${S.note}</textarea>
  <div class="lbl">Voucher</div>
  <div class="vrow"><input id="vin" placeholder="WELCOME50 / GASS10 / FREEDEL" value="${S.voucher||""}"><button data-act="voucher">Apply</button></div>
  ${S.mode=="delivery"?`<div class="lbl">${t("tip")}</div><div class="chipsr">${[0,20,50,100].map(v=>`<button class="mini ${S.tip==v?"on":""}" data-act="tip" data-v="${v}">${tk(v)}</button>`).join("")}</div>`:""}
  <div class="lbl">Payment</div>
  <div class="chipsr">${["bKash","Nagad","Card","Cash"].map(p=>`<button class="mini ${S.pay==p?"on":""}" data-act="pay" data-v="${p}">${p}</button>`).join("")}</div>`;
 $("#cartFoot").innerHTML=`
  <div class="row"><span>${t("sub")}</span><b>${tk(tt.sub)}</b></div>
  <div class="row"><span>${S.mode=="delivery"?t("fee")+" ("+S.loc+")":t("pickup")}</span><b>${tk(tt.fee)}</b></div>
  ${tt.tip?`<div class="row"><span>${t("tip")}</span><b>${tk(tt.tip)}</b></div>`:""}
  ${tt.disc?`<div class="row"><span>${t("disc")}</span><b>−${tk(tt.disc)}</b></div>`:""}
  <div class="row tot"><span>${t("total")}</span><b>${tk(tt.total)}</b></div>
  <button class="primary" data-act="checkout">${t("checkout")}</button>`;
}

function applyVoucher(){
 const code=($("#vin").value||"").trim().toUpperCase();
 if(!code){S.voucher=null;renderCart();return}
 const v=VOUCHERS[code],tt=totals();
 if(!v)return toast("Invalid voucher code");
 if(tt.sub<v.min)return toast("Minimum order "+tk(v.min)+" for this voucher");
 S.voucher=code;renderCart();toast("Voucher applied 🎟️");
}

function openCart(on){
 $("#drawer").classList.toggle("on",on);
 $("#overlay").classList.toggle("on",on);
}

/* fly-to-cart */
function fly(from,emoji){
 const a=from.getBoundingClientRect(),b=$("#cartBtn").getBoundingClientRect();
 const e=document.createElement("div");e.className="fly";e.textContent=emoji;
 e.style.left=a.left+a.width/2-17+"px";e.style.top=a.top+"px";document.body.appendChild(e);
 e.animate([
  {transform:"translate(0,0) scale(1)",opacity:1},
  {transform:`translate(${(b.left-a.left)/2}px,-60px) scale(1.3)`,opacity:1,offset:.4},
  {transform:`translate(${b.left-a.left}px,${b.top-a.top}px) scale(.3)`,opacity:.2}
 ],{duration:800,easing:"ease-in-out"}).onfinish=()=>{
  e.remove();const c=$("#cartBtn");c.classList.remove("bump");void c.offsetWidth;c.classList.add("bump");
 };
}

function confetti(){
 const em=["🎉","🍔","🔋","⚡","🍕","✨"];
 for(let i=0;i<36;i++){
  const s=document.createElement("span");s.className="conf";s.textContent=em[i%em.length];
  s.style.left=Math.random()*100+"vw";document.body.appendChild(s);
  s.animate([{transform:"translateY(0) rotate(0)"},{transform:`translateY(110vh) rotate(${Math.random()*720}deg)`}],
   {duration:1600+Math.random()*1400,easing:"ease-in"}).onfinish=()=>s.remove();
 }
     }

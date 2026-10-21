import fs from "node:fs";
import vm from "node:vm";
const src=fs.readFileSync("data.js","utf8")+";({P,SHOPS})";
const {P}=vm.runInNewContext(src);
const man=JSON.parse(fs.readFileSync("image-manifest.json","utf8")).images;
let bad=0;
for(const p of P){
  if(!fs.existsSync(p.img)){console.error("MISSING FILE:",p.img,"(product",p.id+")");bad++;continue}
  const b=fs.readFileSync(p.img);
  if(b[0]!==0xff||b[1]!==0xd8){console.error("NOT A JPEG:",p.img);bad++;continue}
  if(!man.find(m=>m.productId===p.id&&m.localPath===p.img)){console.error("NOT IN MANIFEST:",p.img);bad++}
  console.log("ok",p.id,p.img,b.length+" bytes");
}
if(bad){console.error(bad+" problem(s)");process.exit(1)}
console.log("All "+P.length+" product photos exist and are listed in image-manifest.json");

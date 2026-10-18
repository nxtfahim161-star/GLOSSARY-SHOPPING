const LOCS={Gulshan:60,Dhanmondi:50,Uttara:80,Mirpur:70,Chattogram:120,Sylhet:130};

const SHOPS=[
{id:"crav",name:"Crav House",cat:"Burgers",e:"🍔",rate:4.8,time:25,fee:40,min:200,offer:"20% off"},
{id:"slice",name:"Slice Hub",cat:"Pizza",e:"🍕",rate:4.6,time:35,fee:0,min:300,offer:"Free delivery"},
{id:"kitchen",name:"Gass Kitchen",cat:"Snacks",e:"🍗",rate:4.4,time:30,fee:30,min:150,offer:""},
{id:"brew",name:"Brew Bro",cat:"Drinks",e:"🥤",rate:4.5,time:20,fee:25,min:100,offer:"Save 10%"},
{id:"volt",name:"VoltMax Batteries",cat:"Batteries",e:"🔋",rate:4.4,time:45,fee:0,min:200,offer:"Free delivery"},
{id:"charge",name:"ChargeX Power",cat:"Power",e:"⚡",rate:4.7,time:50,fee:60,min:500,offer:"15% off"}
];

const P=[
{id:1,shop:"crav",name:"Double Smash Burger",e:"🍔",price:320,old:420,rate:4.8,desc:"Two beef patties, cheese, house sauce",opts:["Regular","Large"]},
{id:2,shop:"crav",name:"Chicken Cheese Burger",e:"🍔",price:250,old:300,rate:4.5,desc:"Crispy chicken with melted cheese",opts:["Regular","Large"]},
{id:3,shop:"slice",name:"Beef Pizza",e:"🍕",price:690,old:850,rate:4.6,desc:"Smoky beef, mozzarella, tomato base",opts:["8 inch","10 inch","12 inch"]},
{id:4,shop:"slice",name:"Pepperoni Pizza",e:"🍕",price:790,old:950,rate:4.7,desc:"Loaded with spicy pepperoni",opts:["8 inch","10 inch","12 inch"]},
{id:5,shop:"kitchen",name:"Crispy Fries",e:"🍟",price:120,old:150,rate:4.3,desc:"Golden, salted, extra crunchy",opts:["Small","Large"]},
{id:6,shop:"kitchen",name:"Fried Chicken Bucket",e:"🍗",price:520,old:640,rate:4.6,desc:"Crispy fried chicken pieces",opts:["6 pcs","12 pcs"]},
{id:7,shop:"kitchen",name:"Noodles Combo",e:"🍜",price:280,old:340,rate:4.2,desc:"Stir-fried noodles with veggies",opts:["Regular","Spicy"]},
{id:8,shop:"brew",name:"Cold Coffee",e:"🥤",price:180,old:220,rate:4.4,desc:"Iced, creamy and strong",opts:["Medium","Large"]},
{id:9,shop:"brew",name:"Mango Lassi",e:"🥭",price:150,old:180,rate:4.5,desc:"Thick, chilled, fresh mango",opts:["Medium","Large"]},
{id:10,shop:"volt",name:"AA Alkaline Battery",e:"🔋",price:240,old:300,rate:4.4,desc:"Long-life alkaline cells",opts:["4 pack","8 pack"]},
{id:11,shop:"volt",name:"AAA Alkaline Battery",e:"🔋",price:220,old:280,rate:4.3,desc:"For remotes, clocks and toys",opts:["4 pack","12 pack"]},
{id:12,shop:"volt",name:"Rechargeable Battery Kit",e:"🔌",price:950,old:1200,rate:4.6,desc:"Rechargeable cells with charger",opts:["AA x4","AAA x4"]},
{id:13,shop:"charge",name:"Power Bank 10000mAh",e:"⚡",price:1450,old:1900,rate:4.7,desc:"Fast charging, dual output",opts:["Black","White"]},
{id:14,shop:"charge",name:"Car Battery 12V",e:"🚗",price:8500,old:9800,rate:4.5,desc:"Heavy duty, 12 month warranty",opts:["45Ah","65Ah"]}
];

const VOUCHERS={
WELCOME50:{type:"flat",val:50,min:300},
GASS10:{type:"pct",val:10,min:200},
FREEDEL:{type:"free",val:0,min:150}
};

const LOCS={Gulshan:60,Dhanmondi:50,Uttara:80,Mirpur:70,Chattogram:120,Sylhet:130};

/* All photos are real photographs saved in the Image/ folder (see image-manifest.json).
   Names, prices and shops are DEMO data. If a photo is missing the app shows a labelled
   "Photo missing" box - it never substitutes another picture. */
const SHOPS=[
{id:"crav",name:"Crav House",cat:"Burgers",rate:4.8,time:25,fee:40,min:200,offer:"20% off"},
{id:"wok",name:"Wok & Fork",cat:"Noodles & Pasta",rate:4.6,time:35,fee:0,min:250,offer:"Free delivery"},
{id:"sunrise",name:"Sunrise Cafe",cat:"Breakfast",rate:4.5,time:30,fee:30,min:150,offer:"Save 10%"},
{id:"sweet",name:"Sweet Spot",cat:"Desserts",rate:4.7,time:20,fee:25,min:100,offer:""}
];

const P=[
{id:1,shop:"crav",name:"Double Smash Burger",img:"Image/burger-double.jpg",pos:"50% 55%",price:320,old:420,rate:4.8,desc:"Two beef patties, cheese, house sauce, pickles",opts:["Regular","Large"]},
{id:2,shop:"crav",name:"Avocado Beef Burger",img:"Image/burger-avocado.jpg",pos:"40% 70%",price:360,old:430,rate:4.6,desc:"Beef patty, avocado, spinach, radish, seeded bun",opts:["Regular","Large"]},
{id:3,shop:"crav",name:"Classic Cheeseburger",img:"Image/burger-classic.jpg",pos:"50% 50%",price:280,old:340,rate:4.7,desc:"Beef patty, cheddar, tomato, onion, lettuce, sesame bun",opts:["Regular","Large"]},
{id:4,shop:"wok",name:"Prawn Noodles",img:"Image/noodles-prawn.jpg",pos:"50% 50%",price:480,old:560,rate:4.6,desc:"Stir-fried noodles with prawns, beef strips, cherry tomato and chives",opts:["Regular","Spicy"]},
{id:5,shop:"wok",name:"Spaghetti in Tomato Sauce",img:"Image/pasta-spaghetti.jpg",pos:"50% 50%",price:340,old:400,rate:4.4,desc:"Spaghetti tossed in tomato sauce with herbs",opts:["Regular","Large"]},
{id:6,shop:"sunrise",name:"Egg & Avocado Toast",img:"Image/toast-egg-avocado.jpg",pos:"50% 45%",price:260,old:310,rate:4.5,desc:"Soft-boiled egg, avocado and spinach on brown toast",opts:["1 toast","2 toasts"]},
{id:7,shop:"sunrise",name:"Sausage Sprout Toast",img:"Image/toast-sausage.jpg",pos:"50% 50%",price:290,old:350,rate:4.3,desc:"Sliced sausage, hard cheese and sprouts on toasted bread",opts:["1 toast","3 toasts"]},
{id:8,shop:"sunrise",name:"Iced Coffee",img:"Image/iced-coffee.jpg",pos:"75% 22%",price:180,old:220,rate:4.4,desc:"Chilled coffee served in a tall glass",opts:["Medium","Large"]},
{id:9,shop:"sweet",name:"Orange Pancakes",img:"Image/pancakes-orange.jpg",pos:"45% 52%",price:240,old:290,rate:4.7,desc:"Golden pancakes with orange segments and blueberries",opts:["2 pcs","4 pcs"]},
{id:10,shop:"sweet",name:"Berry Ice Pop",img:"Image/ice-pop-berry.jpg",pos:"45% 50%",price:120,old:150,rate:4.5,desc:"Creamy berry ice pop, topped with a fresh berry",opts:["1 pc","3 pcs"]}
];

const VOUCHERS={
WELCOME50:{type:"flat",val:50,min:300},
GASS10:{type:"pct",val:10,min:200},
FREEDEL:{type:"free",val:0,min:150}
};
 

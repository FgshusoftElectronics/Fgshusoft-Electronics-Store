const salesCanvas =
document.getElementById("salesChart");

if(salesCanvas){

new Chart(salesCanvas,{

type:"line",

data:{

labels:[
"Mon",
"Tue",
"Wed",
"Thu",
"Fri",
"Sat",
"Sun"
],

datasets:[{

label:"Sales (FCFA)",

data:[
12000,
18000,
16000,
24000,
30000,
26000,
35000
],

borderColor:"#0d6efd",

backgroundColor:"rgba(13,110,253,.15)",

fill:true,

tension:.4

}]

},

options:{

responsive:true,

plugins:{

legend:{
display:false
}

}

}

});

}



const categoryCanvas =
document.getElementById("categoryChart");

if(categoryCanvas){

new Chart(categoryCanvas,{

type:"doughnut",

data:{

labels:[

"IoT",

"Sensors",

"Power",

"Robotics",

"Accessories"

],

datasets:[{

data:[
30,
25,
20,
15,
10
]

}]

},

options:{

plugins:{

legend:{
position:"bottom"
}

}

}

});

}

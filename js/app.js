try{

const products = [

{
name: "ESP32 Development Board",
description: "WiFi + Bluetooth Microcontroller"
},

{
name: "Arduino UNO",
description: "Popular electronics development board"
},

{
name: "DHT11 Sensor",
description: "Temperature and humidity sensor"
},

{
name: "HC-05 Bluetooth Module",
description: "Wireless communication module"
}

];
}
catch(e){
  alert( e.message );
}


const container = document.getElementById("products");


products.forEach(product => {

container.innerHTML += `

<div class="card">

<h3>${product.name}</h3>

<p>${product.description}</p>

</div>

`;

});


console.log("Products loaded successfully");

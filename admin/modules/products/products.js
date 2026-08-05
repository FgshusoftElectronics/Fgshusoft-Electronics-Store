const products = [

{
id:1,

name:"ESP32 Development Board",

category:"IoT",

price:"5000 FCFA",

stock:25,

image:"../../images/esp32.jpg"

},


{
id:2,

name:"Arduino UNO R3",

category:"Microcontroller",

price:"7000 FCFA",

stock:15,

image:"../../images/arduino.jpg"

},


{
id:3,

name:"DHT11 Sensor",

category:"Sensors",

price:"1500 FCFA",

stock:40,

image:"../../images/dht11.jpg"

}

];



function renderProducts(){


const table =
document.getElementById("productsTable");


table.innerHTML="";



products.forEach(product=>{


table.innerHTML += `


<tr>


<td>

<img src="${product.image}"

width="50"

height="50"

class="rounded">

</td>



<td>

<strong>

${product.name}

</strong>

</td>



<td>

<span class="badge bg-info">

${product.category}

</span>

</td>



<td>

${product.price}

</td>



<td>

${product.stock}

</td>



<td>


<button class="btn btn-sm btn-warning">

<i class="fa-solid fa-pen"></i>

</button>


<button class="btn btn-sm btn-danger">

<i class="fa-solid fa-trash"></i>

</button>


</td>


</tr>


`;

});


}



renderProducts();

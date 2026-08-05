    
const products = [

{
    id:1,
    name:"ESP32 Development Board",
    category:"IoT",
    price:5000,
    stock:25,
    image:"../../images/esp32.jpg"
},


{
    id:2,
    name:"Arduino UNO R3",
    category:"Microcontrollers",
    price:7000,
    stock:15,
    image:"../../images/arduino.jpg"
},


{
    id:3,
    name:"DHT11 Temperature Sensor",
    category:"Sensors",
    price:1500,
    stock:40,
    image:"../../images/dht11.jpg"
},


{
    id:4,
    name:"5V 40A Power Supply",
    category:"Power",
    price:25000,
    stock:8,
    image:"../../images/power.jpg"
}


];



const table =
document.getElementById("productsTable");

if(!table){
throw new Error(
"productsTable element not found"
);
}
debug("Table found");
    


    


function displayProducts(list = products){


    table.innerHTML="";


    list.forEach(product=>{


        table.innerHTML += `


<tr>


<td>

<img src="${product.image}"

width="50"

height="50"

class="rounded shadow-sm"

onerror="this.src='../../images/no-image.png'">

</td>



<td>

<strong>

${product.name}

</strong>

</td>



<td>

<span class="badge bg-primary">

${product.category}

</span>

</td>



<td>

${product.price.toLocaleString()} FCFA

</td>



<td>

${product.stock}

</td>



<td>


${
product.stock > 0

?

`<span class="badge bg-success">

Available

</span>`

:

`<span class="badge bg-danger">

Out of Stock

</span>`

}


</td>



<td>


<button class="btn btn-sm btn-warning">

<i class="fa-solid fa-pen"></i>

</button>


<button 
class="btn btn-sm btn-danger"
onclick="deleteProduct(${product.id})">


<i class="fa-solid fa-trash"></i>

</button>


</td>


</tr>


`;



    });


}



function searchProducts(){


const keyword =
document.getElementById(
"searchProduct"
).value.toLowerCase();



const filtered =
products.filter(product=>

product.name
.toLowerCase()
.includes(keyword)

);



displayProducts(filtered);


}




function filterCategory(){


const category =
document.getElementById(
"categoryFilter"
).value;



if(category==="all"){

displayProducts();

return;

}



const filtered =
products.filter(product=>

product.category === category

);



displayProducts(filtered);


}




function deleteProduct(id){


const product =
products.find(
p=>p.id===id
);



Swal.fire({

title:"Delete product?",

text:product.name,

icon:"warning",

showCancelButton:true,

confirmButtonText:"Yes, delete"

}).then(result=>{


if(result.isConfirmed){


Swal.fire(

"Deleted!",

"Product removed",

"success"

);


}
});
}

// Events

document
.getElementById("searchProduct")
.addEventListener(
"input",
searchProducts
);

document
.getElementById("categoryFilter")
.addEventListener(
"change",
filterCategory
);

// Initial load
displayProducts();

// Fgshusoft Electronics Tech
// Main JavaScript


console.log("Fgshusoft Electronics website loaded successfully 🚀");


// Cart

let cart = [];

const cartCount = document.getElementById("cartCount");


// Elements

const productContainer = document.getElementById("products");
const searchBox = document.getElementById("searchBox");
const categoryFilter = document.getElementById("categoryFilter");



// Create categories

function loadCategories(){

    let categories = [
        ...new Set(products.map(product => product.category))
    ];


    categories.forEach(category => {

        categoryFilter.innerHTML += `

        <option value="${category}">
            ${category}
        </option>

        `;

    });

}



// Display products

function displayProducts(productList = products){


    productContainer.innerHTML = "";


    productList.forEach(product => {


        productContainer.innerHTML += `


<div class="card shadow-sm h-100 product-card">


<img src="${product.image}"
class="card-img-top"
alt="${product.name}">



<div class="card-body">


<h5 class="card-title">

<i class="fa-solid ${product.icon} text-primary"></i>

${product.name}

</h5>



<p class="text-muted">

${product.category}

</p>



<p>

${product.description}

</p>



<h4 class="text-success">

${product.price} ${product.currency}

</h4>



<div class="d-grid gap-2">


<button class="btn btn-primary"
onclick="addToCart(${product.id})">

<i class="fa-solid fa-cart-shopping"></i>

Add to Cart

</button>



<button class="btn btn-success"
onclick="telegramOrder('${product.name}')">

<i class="fa-brands fa-telegram"></i>

Order via Telegram

</button>


</div>



</div>

</div>


`;



    });


}




// Search + Filter

function filterProducts(){


let searchValue =
searchBox.value.toLowerCase();


let category =
categoryFilter.value;



let filtered = products.filter(product => {


let matchSearch =
product.name.toLowerCase()
.includes(searchValue);



let matchCategory =
category === "all" ||
product.category === category;



return matchSearch && matchCategory;


});



displayProducts(filtered);


}




// Add to cart

function addToCart(id){


const product =
products.find(item => item.id === id);



cart.push(product);



cartCount.innerHTML =
cart.length;



Swal.fire({

title:"Added to cart 🛒",

text:product.name,

icon:"success",

timer:1500,

showConfirmButton:false

});


}




// Telegram order

function telegramOrder(productName){


Swal.fire({

title:"Telegram Order",

text:"Preparing order for: " + productName,

icon:"info"

});


// Later replace with Telegram Bot API

}





// Events

searchBox.addEventListener(
"input",
filterProducts
);


categoryFilter.addEventListener(
"change",
filterProducts
);



// Start

loadCategories();

displayProducts();

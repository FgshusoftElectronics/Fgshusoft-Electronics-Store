// Fgshusoft Electronics Tech
// Main JavaScript
let cart = [];

let cartCount =
document.getElementById("cartCount");

console.log("Fgshusoft Electronics website loaded successfully 🚀");



// Display products

const productContainer = document.getElementById("products");


function displayProducts() {

    if (!productContainer) {
        console.error("Product container not found");
        return;
    }


    productContainer.innerHTML = "";


    products.forEach(product => {


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


        <button class="btn btn-primary w-100"
        onclick="addToCart('${product.name}')">

        <i class="fa-solid fa-cart-shopping"></i>
        Add to Cart

        </button>

<button class="btn btn-success w-100 mt-2">
<i class="fa-brands fa-telegram"></i>
Order via Telegram
</button>

    </div>

</div>

`;


    });


}

function addToCart(productName){

    Swal.fire({

        title: "Added to cart",
        text: productName + " has been added",
        icon: "success",
        confirmButtonText: "OK"

    });

}


// Load products when page opens

displayProducts();

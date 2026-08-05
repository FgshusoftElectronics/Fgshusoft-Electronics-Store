// Fgshusoft Electronics Tech
// Main JavaScript


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

        <div class="product-card">

            <h3>${product.name}</h3>

            <p>
            Category: ${product.category}
            </p>

            <p>
            ${product.description}
            </p>

            <strong>
            ${product.price} ${product.currency}
            </strong>

        </div>

        `;


    });


Swal.fire({
    title: "Welcome to Fgshusoft Electronics",
    text: "Your trusted electronics components partner in Cameroon",
    icon: "success",
    confirmButtonText: "Continue"
});    

}



// Load products when page opens

displayProducts();

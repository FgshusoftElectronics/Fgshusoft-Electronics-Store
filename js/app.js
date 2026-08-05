// Fgshusoft Electronics Tech
// Product Display + Search + Filter


console.log("Fgshusoft Electronics website loaded successfully 🚀");



// Elements

const productContainer =
document.getElementById("products");


const searchBox =
document.getElementById("searchBox");


const categoryFilter =
document.getElementById("categoryFilter");




// Load categories

function loadCategories(){


    const categories = [
        ...new Set(
            products.map(product => product.category)
        )
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



<button class="btn btn-primary w-100"

onclick="addToCart(${product.id})">


<i class="fa-solid fa-cart-plus"></i>

Add to Cart


</button>



</div>


</div>


`;



    });


}






// Search + category filter

function filterProducts(){


    const searchValue =
    searchBox.value.toLowerCase();



    const selectedCategory =
    categoryFilter.value;



    const filteredProducts =
    products.filter(product => {



        const matchSearch =
        product.name
        .toLowerCase()
        .includes(searchValue);



        const matchCategory =
        selectedCategory === "all" ||
        product.category === selectedCategory;



        return matchSearch && matchCategory;


    });



    displayProducts(filteredProducts);


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





// Start application

loadCategories();

displayProducts();

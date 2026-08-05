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
function displayProducts(productList = products) {

    productContainer.innerHTML = "";

    if (productList.length === 0) {

        productContainer.innerHTML = `

        <div class="col-12">

            <div class="alert alert-warning text-center shadow-sm">

                <i class="fa-solid fa-box-open fa-3x mb-3"></i>

                <h4>No Products Found</h4>

                <p>Try another keyword or category.</p>

            </div>

        </div>

        `;

        return;
    }

    productList.forEach(product => {

        productContainer.innerHTML += `

<div class="col">

<div class="card h-100 border-0 shadow product-card">

    <div class="position-relative">

        <img src="${product.image}"
             class="card-img-top"
             alt="${product.name}"
             style="height:220px;object-fit:cover;">

        <span class="badge bg-primary position-absolute top-0 start-0 m-2">

            <i class="fa-solid ${product.icon}"></i>

            ${product.category}

        </span>

        <span class="badge bg-success position-absolute top-0 end-0 m-2">

            In Stock

        </span>

    </div>



    <div class="card-body d-flex flex-column">

        <h5 class="fw-bold">

            ${product.name}

        </h5>


        <div class="mb-2 text-warning">

            <i class="fa-solid fa-star"></i>
            <i class="fa-solid fa-star"></i>
            <i class="fa-solid fa-star"></i>
            <i class="fa-solid fa-star"></i>
            <i class="fa-solid fa-star-half-stroke"></i>

            <small class="text-muted ms-2">

                (4.8)

            </small>

        </div>



        <p class="text-muted flex-grow-1">

            ${product.description}

        </p>



        <div class="mb-3">

            <h3 class="text-success fw-bold mb-0">

                ${Number(product.price).toLocaleString()} ${product.currency}

            </h3>

        </div>



        <div class="d-grid gap-2">

            <button class="btn btn-primary"

                onclick="addToCart(${product.id})">

                <i class="fa-solid fa-cart-plus"></i>

                Add to Cart

            </button>



            <button class="btn btn-outline-success"

                onclick="viewProduct(${product.id})">

                <i class="fa-solid fa-eye"></i>

                Quick View

            </button>

        </div>

    </div>

</div>

</div>

`;

    });

}


function viewProduct(id){

    const product = products.find(p => p.id === id);

    Swal.fire({

        title: product.name,

        imageUrl: product.image,

        imageHeight: 220,

        html: `
            <p><strong>Category:</strong> ${product.category}</p>
            <p>${product.description}</p>
            <h3 class="text-success">${Number(product.price).toLocaleString()} ${product.currency}</h3>
        `,

        confirmButtonText: "Add to Cart",

        showCancelButton: true,

        cancelButtonText: "Close"

    }).then(result => {

        if(result.isConfirmed){

            addToCart(id);

        }

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

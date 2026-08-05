// Fgshusoft Electronics Tech
// Main JavaScript


console.log("Fgshusoft Electronics website loaded successfully 🚀");


// Temporary products data
// Later this will come from Firebase Firestore

const products = [

    {
        name: "ESP32 Development Board",
        category: "IoT",
        price: "5000 FCFA"
    },

    {
        name: "Arduino UNO R3",
        category: "Microcontroller",
        price: "7000 FCFA"
    },

    {
        name: "DHT11 Temperature Sensor",
        category: "Sensors",
        price: "1500 FCFA"
    }

];



// Display products

const productContainer = document.getElementById("products");


function displayProducts(){

    productContainer.innerHTML = "";


    products.forEach(product => {


        productContainer.innerHTML += `

        <div class="product-card">

            <h3>${product.name}</h3>

            <p>
            Category: ${product.category}
            </p>

            <strong>
            ${product.price}
            </strong>

        </div>

        `;


    });


}


// Load products when page opens

displayProducts();

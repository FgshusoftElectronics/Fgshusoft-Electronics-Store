// Fgshusoft Electronics Tech
// Shopping Cart Logic


let cart = [];



// Add product to cart

function addToCart(productId) {


    const product = products.find(
        item => item.id === productId
    );


    if (!product) return;



    const existing = cart.find(
        item => item.id === productId
    );



    if (existing) {

        existing.quantity++;

    } else {

        cart.push({

            id: product.id,
            name: product.name,
            price: product.price,
            currency: product.currency,
            quantity: 1

        });

    }



    updateCartUI();


    Swal.fire({

        title: "Added to cart 🛒",
        text: product.name,
        icon: "success",
        timer: 1200,
        showConfirmButton: false

    });


}




// Increase quantity

function increaseQuantity(id) {


    const item = cart.find(
        product => product.id === id
    );


    if (item) {

        item.quantity++;

    }


    updateCartUI();

}




// Decrease quantity

function decreaseQuantity(id) {


    const item = cart.find(
        product => product.id === id
    );


    if (item && item.quantity > 1) {

        item.quantity--;

    }


    updateCartUI();

}




// Remove item

function removeFromCart(id) {


    cart = cart.filter(
        item => item.id !== id
    );


    updateCartUI();

}




// Update cart counter and modal

function updateCartUI() {


    const cartCount =
    document.getElementById("cartCount");


    const cartItems =
    document.getElementById("cartItems");


    const cartTotal =
    document.getElementById("cartTotal");



    if (cartCount) {

        cartCount.innerHTML = cart.reduce(
            (total,item)=> total + item.quantity,
            0
        );

    }



    if (!cartItems) return;



    cartItems.innerHTML = "";



    if (cart.length === 0) {


        cartItems.innerHTML = `

        <p class="text-center text-muted">

        Your cart is empty

        </p>

        `;


        cartTotal.innerHTML = "0 FCFA";

        return;

    }




    let total = 0;



    cart.forEach(item => {


        total += item.price * item.quantity;



        cartItems.innerHTML += `


<div class="border rounded p-3 mb-3">


<div class="d-flex justify-content-between">


<strong>
${item.name}
</strong>


<button class="btn btn-danger btn-sm"
onclick="removeFromCart(${item.id})">

<i class="fa-solid fa-trash"></i>

</button>


</div>



<div class="mt-2">

${item.price} ${item.currency}

</div>



<div class="mt-2">


<button class="btn btn-sm btn-secondary"
onclick="decreaseQuantity(${item.id})">

-

</button>


<span class="mx-3">

${item.quantity}

</span>


<button class="btn btn-sm btn-primary"
onclick="increaseQuantity(${item.id})">

+

</button>


</div>



</div>


`;



    });



    cartTotal.innerHTML =
    total + " FCFA";


}

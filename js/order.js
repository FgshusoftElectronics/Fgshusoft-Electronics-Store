// Fgshusoft Electronics Tech
// Order Processing Logic


function placeOrder(){


    if(cart.length === 0){


        Swal.fire({

            title: "Empty Cart",

            text: "Please add products before placing an order",

            icon: "warning"

        });


        return;

    }



    // Generate order number

    const orderID =
    "FGS-" + Date.now();



    // Calculate total

    let total = 0;


    cart.forEach(item => {

        total += item.price * item.quantity;

    });





    // Order object
    // Later this goes to Firestore

    const order = {


        id: orderID,


        items: cart,


        total: total,


        date: new Date().toISOString()


    };



    console.log("New Order:", order);





    Swal.fire({


        title: "Order Placed Successfully ✅",


        html: `

        <p>
        Thank you for choosing
        <strong>Fgshusoft Electronics</strong>
        </p>


        <p>
        Order Number:
        <br>

        <strong>${orderID}</strong>

        </p>


        <p>
        Total:
        <strong>${total} FCFA</strong>
        </p>

        `,


        icon: "success",


        confirmButtonText:"Continue"


    });



    // Clear cart

    cart = [];


    updateCartUI();



}

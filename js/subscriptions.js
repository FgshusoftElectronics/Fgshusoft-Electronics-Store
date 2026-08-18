// ============================================================
// SUBSCRIPTIONS MODULE
// ============================================================

import {
    db,
    collection,
    addDoc,
    getDocs,
    query,
    where,
    serverTimestamp
} from "./firebase-client.js";


console.log(
    "🚀 FGSHUSOFT SUBSCRIPTIONS MODULE STARTING..."
);


// ============================================================
// HELPERS
// ============================================================

function $(id) {

    return document.getElementById(id);

}


// ============================================================
// STATE
// ============================================================

let subscriberCount = 0;


// ============================================================
// LOAD SUBSCRIBER COUNT
// ============================================================

async function loadSubscriberCount() {

    const countElement =
        $("subscriberCount");


    if (!countElement) {

        console.warn(
            "Subscriber count element not found."
        );

        return;

    }


    try {

        countElement.innerHTML = `

            <span
                class="spinner-border
                       spinner-border-sm
                       me-1">
            </span>

            Loading subscribers...

        `;


        // ----------------------------------------------------
        // Get active subscriptions
        // ----------------------------------------------------

        const subscriptionsQuery =
            query(

                collection(
                    db,
                    "subscriptions"
                ),

                where(
                    "status",
                    "==",
                    "active"
                )

            );


        const snapshot =
            await getDocs(
                subscriptionsQuery
            );


        subscriberCount =
            snapshot.size;


        updateSubscriberCount();


    }

    catch (error) {

        console.error(
            "Failed to load subscriber count:",
            error
        );


        countElement.textContent =
            "Join our newsletter";

    }

}


// ============================================================
// UPDATE SUBSCRIBER COUNT UI
// ============================================================

function updateSubscriberCount() {

    const countElement =
        $("subscriberCount");


    if (!countElement) {
        return;
    }


    const count =
        subscriberCount;


    countElement.innerHTML = `

        <strong class="text-dark">

            ${count.toLocaleString()}

        </strong>

        ${
            count === 1
                ? "subscriber"
                : "subscribers"
        }

    `;

}


// ============================================================
// VALIDATE EMAIL
// ============================================================

function isValidEmail(email) {

    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        .test(email);

}


// ============================================================
// CHECK EXISTING SUBSCRIPTION
// ============================================================

async function subscriptionExists(
    email
) {

    const subscriptionsQuery =
        query(

            collection(
                db,
                "subscriptions"
            ),

            where(
                "email",
                "==",
                email
            )

        );


    const snapshot =
        await getDocs(
            subscriptionsQuery
        );


    return !snapshot.empty;

}


// ============================================================
// SUBSCRIBE
// ============================================================

async function subscribeUser(
    email
) {

    const exists =
        await subscriptionExists(
            email
        );


    if (exists) {

        return {
            success: false,
            reason: "exists"
        };

    }


    // --------------------------------------------------------
    // CREATE SUBSCRIPTION
    // --------------------------------------------------------

    const subscription = {

        email,

        status:
            "active",

        source:
            "website",

        createdAt:
            serverTimestamp(),

        updatedAt:
            serverTimestamp()

    };


    const subscriptionRef =
        await addDoc(

            collection(
                db,
                "subscriptions"
            ),

            subscription

        );


    console.log(
        "Subscription created:",
        subscriptionRef.id
    );


    subscriberCount++;

    updateSubscriberCount();


    return {

        success: true,

        id:
            subscriptionRef.id

    };

}


// ============================================================
// HANDLE FORM
// ============================================================

async function handleSubscription(
    event
) {

    event.preventDefault();


    const emailInput =
        $("subscriberEmail");

    const button =
        $("subscribe");


    if (
        !emailInput ||
        !button
    ) {

        console.warn(
            "Subscription form elements missing."
        );

        return;

    }


    const email =
        emailInput.value
            .trim()
            .toLowerCase();


    // --------------------------------------------------------
    // VALIDATION
    // --------------------------------------------------------

    if (!email) {

        await Swal.fire({

            icon:
                "info",

            title:
                "Email required",

            text:
                "Please enter your email address.",

            confirmButtonText:
                "OK"

        });

        emailInput.focus();

        return;

    }


    if (
        !isValidEmail(email)
    ) {

        await Swal.fire({

            icon:
                "warning",

            title:
                "Invalid email",

            text:
                "Please enter a valid email address.",

            confirmButtonText:
                "Try Again"

        });

        emailInput.focus();

        return;

    }


    const originalHTML =
        button.innerHTML;


    try {

        // ----------------------------------------------------
        // LOADING
        // ----------------------------------------------------

        button.disabled =
            true;


        button.innerHTML = `

            <span
                class="spinner-border
                       spinner-border-sm
                       me-1">
            </span>

            Subscribing...

        `;


        // ----------------------------------------------------
        // SAVE
        // ----------------------------------------------------

        const result =
            await subscribeUser(
                email
            );


        // ----------------------------------------------------
        // DUPLICATE
        // ----------------------------------------------------

        if (
            !result.success &&
            result.reason === "exists"
        ) {

            await Swal.fire({

                icon:
                    "info",

                title:
                    "Already subscribed! 🎉",

                text:
                    "This email address is already subscribed to our newsletter.",

                confirmButtonText:
                    "Great!"

            });


            return;

        }


        // ----------------------------------------------------
        // SUCCESS
        // ----------------------------------------------------

        await Swal.fire({

            icon:
                "success",

            title:
                "You're subscribed! 🎉",

            html: `

                <p class="mb-2">

                    Thank you for joining the

                    <strong>
                        Fgshusoft Electronics
                    </strong>

                    newsletter.

                </p>


                <p class="text-muted mb-0">

                    You'll receive new products,
                    tutorials and special offers.

                </p>

            `,

            confirmButtonText:
                "Continue",

            confirmButtonColor:
                "#198754"

        });


        // ----------------------------------------------------
        // RESET
        // ----------------------------------------------------

        emailInput.value = "";


    }

    catch (error) {

        console.error(
            "Subscription failed:",
            error
        );


        await Swal.fire({

            icon:
                "error",

            title:
                "Subscription failed",

            text:
                error.message ||
                "We could not register your subscription. Please try again.",

            confirmButtonText:
                "Try Again"

        });

    }

    finally {

        button.disabled =
            false;

        button.innerHTML =
            originalHTML;

    }

}


// ============================================================
// INITIALIZE
// ============================================================

function initializeSubscriptions() {

    const form =
        $("subscriptionForm");


    if (!form) {

        console.warn(
            "FGSHUSOFT SUBSCRIPTIONS: subscriptionForm not found."
        );

        return;

    }


    // Prevent duplicate event listeners

    if (
        form.dataset.initialized ===
        "true"
    ) {

        return;

    }


    form.dataset.initialized =
        "true";


    form.addEventListener(
        "submit",
        handleSubscription
    );


    loadSubscriberCount();


    console.log(
        "✅ FGSHUSOFT SUBSCRIPTIONS: Ready."
    );

}


// ============================================================
// START
// ============================================================

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initializeSubscriptions,
        {
            once: true
        }
    );

}
else {

    initializeSubscriptions();

}

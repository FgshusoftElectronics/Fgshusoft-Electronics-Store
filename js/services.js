 // ============================================================
// FGSHUSOFT ELECTRONICS
// SERVICES MODULE
// ============================================================

import {
    db,
    addDoc,
    collection,
    getDocs,
    query,
    where,
    serverTimestamp
} from "./firebase-client.js";

import {
    getAuthenticatedClient
} from "./client-auth-ui.js";


// ============================================================
// DOM
// ============================================================

const servicesContainer =
    document.getElementById(
        "servicesContainer"
    );


// ============================================================
// ESCAPE HTML
// ============================================================

function escapeHTML(value) {

    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


// ============================================================
// FORMAT PRICE
// ============================================================

function formatPrice(value) {

    return Number(value || 0)
        .toLocaleString("en-US");
}

function $(id) {
    return document.getElementById(id);
}

// ============================================================
// SERVICE ICON
// ============================================================

function getServiceIcon(name) {

    const value =
        String(name || "")
            .toLowerCase();


    if (
        value.includes("arduino") ||
        value.includes("program")
    ) {
        return "fa-code";
    }


    if (
        value.includes("esp32") ||
        value.includes("iot") ||
        value.includes("embedded")
    ) {
        return "fa-microchip";
    }


    if (
        value.includes("web") ||
        value.includes("website")
    ) {
        return "fa-globe";
    }


    if (
        value.includes("mobile") ||
        value.includes("android")
    ) {
        return "fa-mobile-screen-button";
    }


    if (
        value.includes("solar") ||
        value.includes("renewable")
    ) {
        return "fa-solar-panel";
    }


    if (
        value.includes("robot")
    ) {
        return "fa-robot";
    }


    if (
        value.includes("repair") ||
        value.includes("maintenance")
    ) {
        return "fa-screwdriver-wrench";
    }


    if (
        value.includes("electronic")
    ) {
        return "fa-microchip";
    }


    return "fa-gears";

}


// ============================================================
// RENDER SERVICE CARD
// ============================================================

function renderServiceCard(
    service
) {

    const id =
        service.id;


    const name =
        service.name ||
        "Technology Service";


    const description =
        service.description ||
        "Professional technology service from Fgshusoft Electronics.";


    const duration =
        service.duration ||
        "Contact us";


    const price =
        Number(service.price) || 0;


    const icon =
        getServiceIcon(name);


    return `

        <div class="col-12 col-md-6 col-xl-4">

            <div
                class="service-card h-100">

                <!-- ICON -->

                <div class="service-icon">

                    <i
                        class="fa-solid ${icon}">
                    </i>

                </div>


                <!-- TITLE -->

                <h3 class="service-title">

                    ${escapeHTML(name)}

                </h3>


                <!-- DESCRIPTION -->

                <p class="service-description">

                    ${escapeHTML(description)}

                </p>


                <!-- META -->

                <div class="service-meta">

                    <span
                        class="badge
                               bg-light
                               text-dark">

                        <i
                            class="fa-regular
                                   fa-clock
                                   text-primary
                                   me-1">
                        </i>

                        ${escapeHTML(duration)}

                    </span>


                    <span
                        class="badge
                               bg-success-subtle
                               text-success">

                        <i
                            class="fa-solid
                                   fa-circle-check
                                   me-1">
                        </i>

                        Available

                    </span>

                </div>


                <!-- FOOTER -->

                <div
                    class="d-flex
                           align-items-end
                           justify-content-between
                           gap-3
                           mt-auto">

                    <div>

                        <small
                            class="text-muted d-block">

                            Starting from

                        </small>

                        <div class="service-price">

                            ${formatPrice(price)}

                            <small>
                                FCFA
                            </small>

                        </div>

                    </div>


                    <button
                        type="button"
                        class="btn btn-primary
                               service-btn
                               request-service-btn"
                        data-service-id="${escapeHTML(id)}"
                        data-service-name="${escapeHTML(name)}">

                        <i
                            class="fa-solid
                                   fa-paper-plane
                                   me-1">
                        </i>

                        Request

                    </button>

                </div>

            </div>

        </div>

    `;

}


// ============================================================
// EMPTY STATE
// ============================================================

function renderEmptyServices() {

    servicesContainer.innerHTML = `

        <div class="col-12">

            <div
                class="services-empty
                       text-center">

                <div class="services-empty-icon">

                    <i
                        class="fa-solid
                               fa-screwdriver-wrench">
                    </i>

                </div>


                <h4 class="fw-bold">

                    Services coming soon

                </h4>


                <p class="text-muted mb-0">

                    Our professional services
                    will be available shortly.

                </p>

            </div>

        </div>

    `;

}


// ============================================================
// ERROR STATE
// ============================================================

function renderServiceError() {

    servicesContainer.innerHTML = `

        <div class="col-12">

            <div
                class="alert
                       alert-danger
                       border-0
                       rounded-4
                       shadow-sm
                       text-center
                       py-4">

                <i
                    class="fa-solid
                           fa-triangle-exclamation
                           fa-2x
                           mb-3">
                </i>


                <h5 class="fw-bold">

                    Unable to load services

                </h5>


                <p class="mb-0">

                    Please try again later.

                </p>

            </div>

        </div>

    `;

}


// ============================================================
// REQUEST SERVICE
// ============================================================

async function requestService(service) {

    // --------------------------------------------------------
    // BASIC VALIDATION
    // --------------------------------------------------------

    if (!service) {

        console.error(
            "requestService(): Service is missing."
        );

        return;

    }


    if (
        typeof Swal ===
        "undefined"
    ) {

        alert(
            "Unable to request service."
        );

        return;

    }


    // --------------------------------------------------------
    // CONFIRM SERVICE REQUEST
    // --------------------------------------------------------

    const result =
        await Swal.fire({

            icon:
                "question",

            title:
                "Request Service",

            html: `

                <p class="mb-2">

                    You are requesting:

                </p>


                <h5 class="fw-bold text-primary mb-3">

                    ${escapeHTML(
                        service.name ||
                        "Service"
                    )}

                </h5>


                <div
                    class="
                        bg-light
                        rounded-4
                        p-3
                        text-start
                    ">

                    <div class="mb-3">

                        <i
                            class="
                                fa-regular
                                fa-clock
                                text-primary
                                me-2
                            ">
                        </i>

                        <strong>
                            Duration:
                        </strong>

                        ${escapeHTML(
                            service.duration ||
                            "To be determined"
                        )}

                    </div>


                    <div>

                        <i
                            class="
                                fa-solid
                                fa-money-bill-wave
                                text-success
                                me-2
                            ">
                        </i>

                        <strong>
                            Starting price:
                        </strong>

                        <span class="fw-bold text-success">

                            ${formatPrice(
                                Number(
                                    service.price
                                ) || 0
                            )}
                            FCFA

                        </span>

                    </div>

                </div>

            `,

            showCancelButton:
                true,

            confirmButtonText:
                `
                    <i class="fa-solid fa-paper-plane me-1"></i>
                    Request Service
                `,

            cancelButtonText:
                "Cancel",

            confirmButtonColor:
                "#0d6efd",

            reverseButtons:
                true

        });


    if (
        !result.isConfirmed
    ) {

        return;

    }


    // --------------------------------------------------------
    // VERIFY CLIENT
    // --------------------------------------------------------

    let authResult;

    try {

        authResult =
            await getAuthenticatedClient();

    }

    catch (error) {

        console.error(
            "Client verification failed:",
            error
        );


        await Swal.fire({

            icon:
                "error",

            title:
                "Unable to verify account",

            text:
                "We could not verify your client account. Please try again.",

            confirmButtonText:
                "OK"

        });

        return;

    }


    // --------------------------------------------------------
    // NOT AUTHENTICATED
    // --------------------------------------------------------

    if (
        !authResult?.authenticated
    ) {

        const loginResult =
            await Swal.fire({

                icon:
                    "info",

                title:
                    "Login Required",

                html: `

                    <p>

                        Please login or create a client
                        account before requesting a service.

                    </p>

                    <i
                        class="
                            fa-solid
                            fa-user-lock
                            fa-3x
                            text-primary
                            mt-2
                        ">
                    </i>

                `,

                confirmButtonText:
                    "Login / Create Account",

                showCancelButton:
                    true,

                cancelButtonText:
                    "Cancel",

                reverseButtons:
                    true

            });


        if (
            loginResult.isConfirmed
        ) {

            document
                .getElementById(
                    "authNavBtn"
                )
                ?.click();

        }


        return;

    }


    // --------------------------------------------------------
    // FIRESTORE CLIENT PROFILE MUST EXIST
    // --------------------------------------------------------

    if (
        !authResult.exists ||
        !authResult.client
    ) {

        await Swal.fire({

            icon:
                "warning",

            title:
                "Client Profile Not Found",

            html: `

                <p>

                    Your account is authenticated,
                    but your client profile could not
                    be found.

                </p>

                <p class="mb-0">

                    Please contact support before
                    requesting a service.

                </p>

            `,

            confirmButtonText:
                "OK"

        });


        return;

    }


    // --------------------------------------------------------
    // VERIFIED CLIENT
    // --------------------------------------------------------

    const user =
        authResult.user;

    const client =
        authResult.client;


    console.log(
        "Verified client for service request:",
        client
    );


    // --------------------------------------------------------
    // SAVE REQUEST
    // --------------------------------------------------------

    try {

        // Optional loading state

        Swal.fire({

            title:
                "Submitting Request...",

            html:
                "Please wait while we submit your service request.",

            allowOutsideClick:
                false,

            allowEscapeKey:
                false,

            didOpen: () => {

                Swal.showLoading();

            }

        });


        const requestRef =
            await addDoc(

                collection(
                    db,
                    "serviceRequests"
                ),

                {

                    // ----------------------------------------
                    // SERVICE
                    // ----------------------------------------

                    serviceId:
                        String(
                            service.id ||
                            service.serviceId ||
                            ""
                        ),

                    serviceName:
                        service.name ||
                        "",


                    serviceDuration:
                        service.duration ||
                        "",

                    servicePrice:
                        Number(
                            service.price
                        ) || 0,


                    // ----------------------------------------
                    // CLIENT
                    // ----------------------------------------

                    clientId:
                        user.uid,

                    clientName:
                        client.name ||
                        user.displayName ||
                        "Client",

                    clientEmail:
                        client.email ||
                        user.email ||
                        "",

                    clientPhone:
                        client.phone ||
                        "",


                    // ----------------------------------------
                    // REQUEST
                    // ----------------------------------------

                    status:
                        "pending",

                    createdAt:
                        serverTimestamp(),

                    updatedAt:
                        serverTimestamp()

                }

            );

        // ----------------------------------------------------
        // REQUEST ID
        // ----------------------------------------------------

        const requestId =
            requestRef.id;


        console.log(
            "Service request created:",
            requestId
        );


        // ----------------------------------------------------
        // SUCCESS
        // ----------------------------------------------------

        await Swal.fire({

            icon:
                "success",

            title:
                "Request Received! 🎉",

            html: `

                <div class="py-2">

                    <div class="mb-3">

                        <i
                            class="
                                fa-solid
                                fa-circle-check
                                fa-4x
                                text-success
                            ">
                        </i>

                    </div>


                    <p class="mb-2">

                        Your request for

                    </p>


                    <h5 class="fw-bold text-primary">

                        ${escapeHTML(
                            service.name ||
                            "this service"
                        )}

                    </h5>


                    <div
                        class="
                            bg-light
                            rounded-4
                            p-3
                            mt-3
                        ">

                        <small class="text-muted">
                            Request ID
                        </small>

                        <div class="fw-bold">

                            ${escapeHTML(
                                requestId
                            )}

                        </div>

                    </div>


                    <p class="text-muted mt-3 mb-0">

                        Our team will contact you
                        shortly.

                    </p>

                </div>

            `,

            confirmButtonText:
                "Continue",

            confirmButtonColor:
                "#198754"

        });


    }

    catch (error) {

        console.error(
            "Failed to create service request:",
            error
        );


        await Swal.fire({

            icon:
                "error",

            title:
                "Request Failed",

            text:
                error.message ||
                "We could not submit your service request. Please try again.",

            confirmButtonText:
                "Try Again"

        });

    }

}


// ============================================================
// INITIALIZE BUTTONS
// ============================================================

function initializeServiceButtons(
    services
) {

    document
        .querySelectorAll(
            ".request-service-btn"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const service =
                        services.find(
                            item =>
                                item.id ===
                                button.dataset.serviceId
                        );


                    if (!service) {
                        return;
                    }


                    requestService(
                        service
                    );

                }
            );

        });

}


// ============================================================
// LOAD SERVICES
// ============================================================

async function loadServices() {

    if (!servicesContainer) {

        console.warn(
            "Services container not found."
        );

        return;

    }


    try {

        const servicesQuery =
            query(

                collection(
                    db,
                    "services"
                ),

                where(
                    "type",
                    "==",
                    "service"
                ),

                where(
                    "status",
                    "==",
                    "active"
                ),

                where(
                    "visible",
                    "==",
                    true
                )

            );


        const snapshot =
            await getDocs(
                servicesQuery
            );


        if (snapshot.empty) {

            renderEmptyServices();

            return;

        }


        const services =
            snapshot.docs.map(
                serviceDoc => ({

                    id:
                        serviceDoc.id,

                    ...serviceDoc.data()

                })
            );


        servicesContainer.innerHTML =
            services
                .map(
                    renderServiceCard
                )
                .join("");


        initializeServiceButtons(
            services
        );


        console.log(
            `FGSHUSOFT: ${services.length} services loaded.`
        );

    }

    catch (error) {

        console.error(
            "Failed to load services:",
            error
        );


        renderServiceError();

    }

}


// ============================================================
// START
// ============================================================

if (document.readyState === "loading") {

    document.addEventListener(
        "DOMContentLoaded",
        loadServices
    );

} else {

    loadServices();

}


// ============================================================
// CONTACT MESSAGE
// ============================================================

async function sendContactMessage(event) {

    event.preventDefault();


    const form =
        document.getElementById("contactForm");

    const button =
        document.getElementById("sendMessageBtn");


    if (!form || !button) {

        console.error(
            "Contact form elements not found."
        );

        return;

    }


    // --------------------------------------------------------
    // GET VALUES
    // --------------------------------------------------------

    const name =
        document
            .getElementById("sendName")
            ?.value
            .trim() || "";


    const phone =
        document
            .getElementById("sendPhone")
            ?.value
            .trim() || "";


    const email =
        document
            .getElementById("sendEmail")
            ?.value
            .trim() || "";


    const message =
        document
            .getElementById("sendMessage")
            ?.value
            .trim() || "";


    // --------------------------------------------------------
    // VALIDATION
    // --------------------------------------------------------

    if (!name) {

        Swal.fire({

            icon: "warning",

            title: "Name required",

            text:
                "Please enter your name."

        });

        return;

    }


    if (!phone) {

        Swal.fire({

            icon: "warning",

            title: "Phone number required",

            text:
                "Please enter your phone number."

        });

        return;

    }


    if (!email) {

        Swal.fire({

            icon: "warning",

            title: "Email required",

            text:
                "Please enter your email address."

        });

        return;

    }


    if (!message) {

        Swal.fire({

            icon: "warning",

            title: "Message required",

            text:
                "Please enter your message."

        });

        return;

    }


    // --------------------------------------------------------
    // EMAIL VALIDATION
    // --------------------------------------------------------

    const emailPattern =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


    if (!emailPattern.test(email)) {

        Swal.fire({

            icon: "warning",

            title: "Invalid email",

            text:
                "Please enter a valid email address."

        });

        return;

    }


    // --------------------------------------------------------
    // SAVE ORIGINAL BUTTON
    // --------------------------------------------------------

    const originalHTML =
        button.innerHTML;


    try {

        // ----------------------------------------------------
        // DISABLE BUTTON
        // ----------------------------------------------------

        button.disabled = true;

        button.innerHTML = `

            <span
                class="spinner-border spinner-border-sm me-2"
                aria-hidden="true">
            </span>

            Sending...

        `;


        // ----------------------------------------------------
        // CREATE MESSAGE
        // ----------------------------------------------------

        const messageRef =
            await addDoc(

                collection(
                    db,
                    "messages"
                ),

                {

                    name:
                        name,

                    phone:
                        phone,

                    email:
                        email,

                    message:
                        message,

                    status:
                        "unread",

                    type:
                        "contact",

                    createdAt:
                        serverTimestamp(),

                    updatedAt:
                        serverTimestamp()

                }

            );


        console.log(
            "Message created:",
            messageRef.id
        );


        // ----------------------------------------------------
        // SUCCESS
        // ----------------------------------------------------

        await Swal.fire({

            icon:
                "success",

            title:
                "Message Sent! 🎉",

            html: `

                <div class="py-2">

                    <div class="mb-3">

                        <i
                            class="
                                fa-solid
                                fa-circle-check
                                fa-4x
                                text-success
                            ">
                        </i>

                    </div>

                    <h5 class="fw-bold">
                        Thank you, ${escapeHTML(name)}!
                    </h5>

                    <p class="text-muted mb-0">

                        Your message has been received.
                        We'll get back to you as soon as possible.

                    </p>

                </div>

            `,

            confirmButtonText:
                "Continue",

            confirmButtonColor:
                "#0d6efd"

        });


        // ----------------------------------------------------
        // RESET FORM
        // ----------------------------------------------------
 message.value = "";
       // form.reset();

    }

    catch (error) {

        console.error(
            "Failed to send contact message:",
            error
        );


        await Swal.fire({

            icon:
                "error",

            title:
                "Message Not Sent",

            text:
                `We couldn't send your message. Please try again.[${error.message}]`,

            confirmButtonText:
                "Try Again"

        });

    }

    finally {

        // ----------------------------------------------------
        // RESTORE BUTTON
        // ----------------------------------------------------

        button.disabled = false;

        button.innerHTML =
            originalHTML;

    }

}

document.addEventListener(
    "DOMContentLoaded",
    () => {

        const contactForm =
            document.getElementById(
                "contactForm"
            );


        if (contactForm) {

            contactForm.addEventListener(
                "submit",
                sendContactMessage
            );

        }

    }
);
    

// ============================================================
// AUTH FUNCTIONS
// ============================================================
import {
    db,
    doc,
    getDoc
} from "./firebase-client.js";


import {
    registerClient,
    loginClient,
    logoutClient,
    watchClientAuth,
    getCurrentClient
} from "./auth.js";


import {
    showLoader,
    updateLoader,
    hideLoader
} from "./loader.js";


// ============================================================
// CLIENT PROFILE / CURRENT USER
// ============================================================

import {
    getCurrentClientData
} from "./client-auth.js";

// ============================================================
// STATE
// ============================================================

let authMode = "login";

let currentUser = null;

let currentClient = null;
// ============================================================
// DOM REFERENCES
// ============================================================

let authModalElement = null;
let authModal = null;

let loginForm = null;
let registerForm = null;

let authModalTitle = null;
let authSwitchText = null;
let authSwitchBtn = null;
let authAlert = null;

let authNavBtn = null;

let sendName = null;
let sendPhone = null;
let sendEmail = null;

let initialized = false;

// ============================================================
// DOM HELPERS
// ============================================================

function $(id) {

    return document.getElementById(id);

}


function setText(
    id,
    value
) {

    const element =
        $(id);


    if (element) {

        element.textContent =
            value ?? "";

    }

}


// ============================================================
// FORMAT FIRESTORE TIMESTAMP
// ============================================================

function formatFirestoreDate(value) {

    if (!value) {
        return "Not available";
    }


    try {

        // Firebase Timestamp
        if (
            typeof value.toDate === "function"
        ) {

            return value
                .toDate()
                .toLocaleString();

        }


        // JavaScript Date
        if (
            value instanceof Date
        ) {

            return value.toLocaleString();

        }


        // Firestore REST timestamp / serialized timestamp
        if (
            value.seconds !== undefined
        ) {

            return new Date(
                Number(value.seconds) * 1000
            ).toLocaleString();

        }


        // ISO string / normal date value
        const date =
            new Date(value);


        if (
            !isNaN(date.getTime())
        ) {

            return date.toLocaleString();

        }


        return String(value);

    }

    catch (error) {

        console.warn(
            "Unable to format Firestore date:",
            value,
            error
        );

        return "Invalid date";

    }

}
// ============================================================
// INITIALIZE DOM
// ============================================================

function initializeAuthUI() {

    authModalElement =
        $("authModal");

    authNavBtn =
        $("authNavBtn");

    loginForm =
        $("loginForm");

    registerForm =
        $("registerForm");

    authModalTitle =
        $("authModalTitle");

    authSwitchText =
        $("authSwitchText");

    authSwitchBtn =
        $("authSwitchBtn");

    authAlert =
        $("authAlert");


sendName =
        $("sendName");
sendPhone =
        $("sendPhone");
sendEmail =
        $("sendEmail");
    // --------------------------------------------------------
    // REQUIRED ELEMENTS
    // --------------------------------------------------------

    const missing = [];


    if (!authModalElement)
        missing.push("authModal");


    if (!authNavBtn)
        missing.push("authNavBtn");


    if (!loginForm)
        missing.push("loginForm");


    if (!registerForm)
        missing.push("registerForm");


    if (!authModalTitle)
        missing.push("authModalTitle");


    if (!authSwitchText)
        missing.push("authSwitchText");


    if (!authSwitchBtn)
        missing.push("authSwitchBtn");


    if (missing.length) {

        console.error(
            "FGSHUSOFT AUTH UI: Missing elements:",
            missing
        );

        return false;

    }


    if (
        typeof bootstrap ===
        "undefined"
    ) {

        console.error(
            "FGSHUSOFT AUTH UI: Bootstrap is not loaded."
        );

        return false;

    }


    authModal =
        bootstrap.Modal.getOrCreateInstance(
            authModalElement
        );


    initialized = true;


    console.log(
        "FGSHUSOFT Auth UI initialized."
    );


    return true;

}


// ============================================================
// ALERT
// ============================================================

function showAuthAlert(
    message,
    type = "danger"
) {

    if (!authAlert) {
        return;
    }


    authAlert.className =
        `alert alert-${type}`;


    authAlert.textContent =
        message;


    authAlert.classList.remove(
        "d-none"
    );

}


// ============================================================
// HIDE ALERT
// ============================================================

function hideAuthAlert() {

    if (!authAlert) {
        return;
    }


    authAlert.classList.add(
        "d-none"
    );

}


// ============================================================
// AUTH FORM MODE
// ============================================================

function setAuthMode(mode) {

    if (
        mode !== "login" &&
        mode !== "register"
    ) {

        mode = "login";

    }


    authMode = mode;

    hideAuthAlert();


    // ========================================================
    // LOGIN MODE
    // ========================================================

    if (authMode === "login") {

        loginForm?.classList.remove(
            "d-none"
        );

        registerForm?.classList.add(
            "d-none"
        );


        if (authModalTitle) {

            authModalTitle.textContent =
                "Client Login";

        }


        if (authSwitchText) {

            authSwitchText.textContent =
                "Don't have an account?";

        }


        if (authSwitchBtn) {

            authSwitchBtn.textContent =
                "Create Account";

        }

        return;

    }


    // ========================================================
    // REGISTER MODE
    // ========================================================

    loginForm?.classList.add(
        "d-none"
    );

    registerForm?.classList.remove(
        "d-none"
    );


    if (authModalTitle) {

        authModalTitle.textContent =
            "Create Client Account";

    }


    if (authSwitchText) {

        authSwitchText.textContent =
            "Already have an account?";

    }


    if (authSwitchBtn) {

        authSwitchBtn.textContent =
            "Login";

    }

}


// ============================================================
// OPEN AUTH MODAL
// ============================================================

function openAuthModal(
    mode = "login"
) {

    if (!authModal) {

        console.warn(
            "Auth modal is not initialized."
        );

        return;

    }


    // IMPORTANT:
    // Auth modal is only for unauthenticated users.

    if (currentUser) {

        console.log(
            "Client already authenticated. Opening account modal."
        );

        showAccountModal(
            currentUser
        );

        return;

    }


    setAuthMode(mode);

    authModal.show();

}


// ============================================================
// ACCOUNT MODAL
// ============================================================

async function showAccountModal(user) {

    if (!user) {

        openAuthModal("login");

        return;

    }


    console.log(
        "Loading account profile:",
        `users/${user.uid}`
    );


    // ========================================================
    // SHOW LOADING STATE
    // ========================================================

    setText(
        "accountName",
        "Loading..."
    );

    setText(
        "accountEmail",
        user.email || ""
    );

    setText(
        "accountStatus",
        "Loading profile..."
    );


    const logoutBtn =
        $("logoutBtn");


    if (logoutBtn) {

        logoutBtn.style.display =
            "inline-block";

        logoutBtn.disabled =
            false;

    }


    const accountModalElement =
        $("accountModal");


    if (!accountModalElement) {

        console.warn(
            "accountModal was not found."
        );

        return;

    }


    const accountModal =
        bootstrap.Modal.getOrCreateInstance(
            accountModalElement
        );


    accountModal.show();


    // ========================================================
    // LOAD users/{uid}
    // ========================================================

    try {

        const userRef =
            doc(
                db,
                "clients",
                user.uid
            );


        const snapshot =
            await getDoc(userRef);


        if (!snapshot.exists()) {

            console.warn(
                "No Firestore user document:",
                `clients/${user.uid}`
            );


            currentClient = {

                uid:
                    user.uid,

                email:
                    user.email || "",

                name:
                    user.displayName ||
                    user.email?.split("@")[0] ||
                    "Client",

                phone: "",

                address: "",

                role: "client",

                createdAt: null,

                updatedAt: null

            };


            renderAccountProfile(
                user,
                currentClient
            );


            return;

        }


        const data =
            snapshot.data();


        currentClient = {

            uid:
                data.uid ||
                user.uid,

            email:
                data.email ||
                user.email ||
                "",

            name:
                data.name ||
                user.displayName ||
                user.email?.split("@")[0] ||
                "Client",

            phone:
                data.phone ||
                "",

            address:
                data.address ||
                "",

            role:
                data.role ||
                "client",

            createdAt:
                data.createdAt ||
                null,

            updatedAt:
                data.updatedAt ||
                null

        };

        console.log(
            "Account profile loaded:",
            currentClient
        );


        renderAccountProfile(
            user,
            currentClient
        );

    }

    catch (error) {

        console.error(
            "Unable to load account profile:",
            error
        );


        setText(
            "accountStatus",
            "Unable to load profile"
        );


        if (
            typeof Swal !==
            "undefined"
        ) {

            Swal.fire({

                icon: "error",

                title: "Profile error",

                text:
                    "Unable to load your account information."

            });

        }

    }

}


// ============================================================
// RENDER ACCOUNT PROFILE
// ============================================================

function renderAccountProfile(
    user,
    profile
) {

    if (!user || !profile) {
        return;
    }

    const name =
        profile.name ||
        "Client";


    const email =
        profile.email ||
        user.email ||
        "";


    const phone =
        profile.phone ||
        "Not provided";
        
sendPhone.value = profile.phone;

    const address =
        profile.address ||
        "Not provided";


    const role =
        profile.role ||
        "client";


    const uid =
        profile.uid ||
        user.uid ||
        "";


    // ========================================================
    // SUMMARY
    // ========================================================

    setText(
        "accountName",
        name
    );


    setText(
        "accountEmail",
        email
    );


    setText(
        "accountStatus",
        "Signed in"
    );


    // ========================================================
    // FULL PROFILE
    // ========================================================

    setText(
        "accountFullName",
        name
    );


    setText(
        "accountEmailFull",
        email
    );


    setText(
        "accountPhone",
        phone
    );


    setText(
        "accountAddress",
        address
    );


    setText(
        "accountUID",
        uid
    );


    setText(
        "accountRole",
        role
    );


    setText(
        "accountCreatedAt",
        formatFirestoreDate(
            profile.createdAt
        )
    );


    setText(
        "accountUpdatedAt",
        formatFirestoreDate(
            profile.updatedAt
        )
    );


    // ========================================================
    // AVATAR
    // ========================================================

    const avatar =
        $("accountAvatar");


    if (avatar) {

        const initials =
            name
                .trim()
                .split(/\s+/)
                .filter(Boolean)
                .slice(0, 2)
                .map(
                    part =>
                        part
                            .charAt(0)
                            .toUpperCase()
                )
                .join("");


        avatar.textContent =
            initials || "U";

    }


    // ========================================================
    // ROLE BADGE
    // ========================================================

    const roleBadge =
        $("accountRole");


    if (roleBadge) {

        roleBadge.textContent =
            role.toUpperCase();

    }


    // ========================================================
    // LOGOUT
    // ========================================================

    const logoutBtn =
        $("logoutBtn");


    if (logoutBtn) {

        logoutBtn.style.display =
            "inline-block";

        logoutBtn.disabled =
            false;

    }

}

// ============================================================
// GUEST ACCOUNT MODAL
// ============================================================

function showGuestAccountModal() {

    const accountModalElement =
        $("accountModal");


    if (!accountModalElement) {

        openAuthModal("login");

        return;

    }


    const accountName =
        $("accountName");

    const accountEmail =
        $("accountEmail");

    const accountStatus =
        $("accountStatus");

    const logoutBtn =
        $("logoutBtn");


    if (accountName) {

        accountName.textContent =
            "Guest";

    }


    if (accountEmail) {

        accountEmail.textContent =
            "Not signed in";

    }


    if (accountStatus) {

        accountStatus.textContent =
            "Guest mode";

    }


    if (logoutBtn) {

        logoutBtn.style.display =
            "none";

    }


    const accountModal =
        bootstrap.Modal.getOrCreateInstance(
            accountModalElement
        );


    accountModal.show();

}


// ============================================================
// NAVBAR
// ============================================================

function updateNavbar(
    user,
    client = null
) {

    if (!authNavBtn) {
        return;
    }


    // ========================================================
    // SIGNED IN
    // ========================================================

    if (user) {

        currentUser =
            user;

        currentClient =
            client ||
            currentClient ||
            null;


        const name =
            currentClient?.name ||
            user.displayName ||
            user.email?.split("@")[0] ||
            "Client";

//sendEmail.value = user.email;

        authNavBtn.classList.remove(
            "btn-warning"
        );

        authNavBtn.classList.add(
            "btn-light"
        );


        authNavBtn.innerHTML = `

            <i class="fa-solid fa-user-check me-1"></i>

            <span>
                ${escapeHTML(name)}
            </span>

        `;


        authNavBtn.title =
            `${name} — Open account`;


        console.log(
            "Client authenticated:",
            name
        );
sendName.value = currentClient.name;
sendEmail.value = currentClient.email;
sendPhone.value = currentClient.phone;


        return;

    }


    // ========================================================
    // SIGNED OUT
    // ========================================================

    currentUser = null;

    currentClient = null;


    authNavBtn.classList.remove(
        "btn-light"
    );

    authNavBtn.classList.add(
        "btn-warning"
    );


    authNavBtn.innerHTML = `

        <i class="fa-solid fa-user me-1"></i>

        <span>
            Login
        </span>

    `;


    authNavBtn.title =
        "Login or create an account";

}

// ============================================================
// SIMPLE HTML ESCAPE
// ============================================================

function escapeHTML(value) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


// ============================================================
// ACCOUNT BUTTON
// ============================================================

async function handleAccountButton() {

    console.log(
        "Account button clicked."
    );


    // ========================================================
    // CURRENT AUTH USER
    // ========================================================

    let user =
        currentUser ||
        getCurrentClient();


    // ========================================================
    // AUTHENTICATED
    // ========================================================

    if (user) {

        currentUser =
            user;


        console.log(
            "Authenticated user:",
            user.email
        );


        await showAccountModal(
            user
        );


        return;

    }


    // ========================================================
    // GUEST
    // ========================================================

    console.log(
        "No authenticated client. Opening login."
    );


    openAuthModal(
        "login"
    );

}

// ============================================================
// LOGIN
// ============================================================

async function handleLogin(event) {

    event.preventDefault();

    hideAuthAlert();


    const emailInput =
        $("loginEmail");

    const passwordInput =
        $("loginPassword");

    const button =
        $("loginSubmitBtn");


    if (
        !emailInput ||
        !passwordInput ||
        !button
    ) {

        console.error(
            "Login form elements are missing."
        );

        return;

    }


    const email =
        emailInput.value.trim();


    const password =
        passwordInput.value;


    if (!email || !password) {

        showAuthAlert(
            "Please enter your email and password."
        );

        return;

    }


    const originalHTML =
        button.innerHTML;


    try {

        button.disabled = true;

        button.innerHTML = `

            <span
                class="spinner-border spinner-border-sm me-2">
            </span>

            Logging in...

        `;


        const user =
            await loginClient(
                email,
                password
            );


        console.log(
            "Client logged in:",
            user
        );


        // Firebase auth watcher will update
        // currentUser and navbar.


        if (
            typeof Swal !==
            "undefined"
        ) {

            await Swal.fire({

                icon: "success",

                title: "Welcome back!",

                text:
                    `Welcome ${
                        user.displayName ||
                        user.email
                    }`,

                timer: 1800,

                showConfirmButton:
                    false

            });

        }


        authModal?.hide();

        loginForm?.reset();


    }

    catch (error) {

        console.error(
            "Login error:",
            error
        );


        let message =
            "Unable to login.";


        switch (error.code) {

            case "auth/invalid-credential":

                message =
                    "Incorrect email or password.";

                break;


            case "auth/user-not-found":

                message =
                    "No account exists with this email.";

                break;


            case "auth/wrong-password":

                message =
                    "Incorrect password.";

                break;


            case "auth/invalid-email":

                message =
                    "Please enter a valid email address.";

                break;


            case "auth/too-many-requests":

                message =
                    "Too many login attempts. Please try again later.";

                break;


            default:

                message =
                    error.message ||
                    "Login failed.";

        }


        showAuthAlert(
            message
        );

    }

    finally {

        button.disabled = false;

        button.innerHTML =
            originalHTML;

    }

}


// ============================================================
// REGISTER
// ============================================================

async function handleRegister(event) {
    
    event.preventDefault();

    hideAuthAlert();


    const nameInput =
        $("registerName");

    const emailInput =
        $("registerEmail");
    
    const addressInput =
        $("registerAddress");

    const phoneInput =
        $("registerPhone");
        
    const passwordInput =
        $("registerPassword");

    const confirmInput =
        $("registerConfirmPassword");

    const button =
        $("registerSubmitBtn");


    if (
        !nameInput ||
        !emailInput ||
        !passwordInput ||
        !confirmInput ||
        !button ||
        !addressInput ||
        !phoneInput
    ) {

        console.error(
            "Registration form elements are missing."
        );

        return;

    }

    const name =
        nameInput.value.trim();

    const email =
        emailInput.value.trim();

    const password =
        passwordInput.value;


    const confirmPassword =
        confirmInput.value;

   const phone = phoneInput.value;

   const address = addressInput.value;   

    if (!name) {

        showAuthAlert(
            "Please enter your name."
        );

        return;

    }


    if (!email) {
        showAuthAlert(
            "Please enter your email."
        );

        return;

    }

    if (!address) {
        showAuthAlert(
            "Please enter your Location Address."
        );

        return;

    }
 
     if (!phone) {
        showAuthAlert(
            "Please enter your Phone Number."
        );
        return;
    }
 

    if (
        password.length <
        6
    ) {

        showAuthAlert(
            "Password must contain at least 6 characters."
        );

        return;

    }


    if (
        password !==
        confirmPassword
    ) {

        showAuthAlert(
            "Passwords do not match."
        );

        return;

    }


    const originalHTML =
        button.innerHTML;


    try {

        button.disabled = true;

        button.innerHTML = `

            <span
                class="spinner-border spinner-border-sm me-2">
            </span>

            Creating account...

        `;

        const user =
            await registerClient(
                name,
                email,
                password,
                phone,
                address 
            );


        console.log(
            "Client registered:",
            user
        );


        if (
            typeof Swal !==
            "undefined"
        ) {

            await Swal.fire({

                icon: "success",

                title: "Account Created!",

                text:
                    "Your Fgshusoft client account has been created successfully.",

                timer: 2000,

                showConfirmButton:
                    false

            });

        }


        authModal?.hide();

        registerForm?.reset();


    }

    catch (error) {

        console.error(
            "Registration error:",
            error
        );


        let message =
            "Unable to create account.";


        switch (error.code) {

            case "auth/email-already-in-use":

                message =
                    "An account already exists with this email.";

                break;


            case "auth/invalid-email":

                message =
                    "Please enter a valid email address.";

                break;


            case "auth/weak-password":

                message =
                    "Password must contain at least 6 characters.";

                break;


            default:

                message =
                    error.message ||
                    "Registration failed.";

        }


        showAuthAlert(
            message
        );

    }

    finally {

        button.disabled = false;

        button.innerHTML =
            originalHTML;

    }

}


// ============================================================
// LOGOUT
// ============================================================

async function handleLogout() {

    const logoutBtn =
        $("logoutBtn");


    if (logoutBtn) {

        logoutBtn.disabled =
            true;

    }


    try {

        console.log(
            "Logging out client..."
        );


        await logoutClient();


        console.log(
            "Client successfully logged out."
        );


        const accountModalElement =
            $("accountModal");


        if (accountModalElement) {

            const accountModal =
                bootstrap.Modal.getInstance(
                    accountModalElement
                );


            accountModal?.hide();

        }


        if (
            typeof Swal !==
            "undefined"
        ) {

            await Swal.fire({

                icon: "success",

                title: "Logged out",

                text:
                    "You have been successfully logged out.",

                timer: 1500,

                showConfirmButton:
                    false

            });

        }

    }

    catch (error) {

        console.error(
            "Logout error:",
            error
        );


        if (
            typeof Swal !==
            "undefined"
        ) {

            await Swal.fire({

                icon: "error",

                title: "Logout failed",

                text:
                    error.message ||
                    "Unable to logout."

            });

        }


        if (logoutBtn) {

            logoutBtn.disabled =
                false;

        }

    }

}


// ============================================================
// EVENTS
// ============================================================

function initializeEvents() {

    if (authNavBtn) {

        authNavBtn.addEventListener(
            "click",
            handleAccountButton
        );

    }


    if (authSwitchBtn) {

        authSwitchBtn.addEventListener(
            "click",
            () => {

                setAuthMode(
                    authMode === "login"
                        ? "register"
                        : "login"
                );

            }
        );

    }


    if (loginForm) {

        loginForm.addEventListener(
            "submit",
            handleLogin
        );

    }


    if (registerForm) {

        registerForm.addEventListener(
            "submit",
            handleRegister
        );

    }


    const logoutBtn =
        $("logoutBtn");


    if (logoutBtn) {

        logoutBtn.addEventListener(
            "click",
            handleLogout
        );

    }


    console.log(
        "FGSHUSOFT auth events initialized."
    );

}


// ============================================================
// AUTH STATE WATCHER
// ============================================================

function initializeAuthWatcher() {

    watchClientAuth(
        async user => {

            console.log(
                "AUTH STATE:",
                user
                    ? `SIGNED IN → ${user.email}`
                    : "SIGNED OUT"
            );


            // =================================================
            // SIGNED OUT
            // =================================================

            if (!user) {

                currentUser = null;

                currentClient = null;

                updateNavbar(
                    null,
                    null
                );

                return;

            }


            // =================================================
            // SIGNED IN
            // =================================================

            currentUser =
                user;


            // =================================================
            // TEMPORARY FIREBASE FALLBACK
            // =================================================

            let profile = {

                uid:
                    user.uid,

                email:
                    user.email || "",

                name:
                    user.displayName ||
                    user.email?.split("@")[0] ||
                    "Client",

                phone: "",

                address: "",

                role: "client",

                createdAt: null,

                updatedAt: null

            };


            // =================================================
            // GET users/{uid}
            // =================================================

            try {

                const userRef =
                    doc(
                        db,
                        "clients",
                        user.uid
                    );


                const snapshot =
                    await getDoc(
                        userRef
                    );


                if (snapshot.exists()) {

                    const data =
                        snapshot.data();


                    profile = {

                        ...profile,

                        ...data,

                        uid:
                            data.uid ||
                            user.uid,

                        email:
                            data.email ||
                            user.email ||
                            "",

                        name:
                            data.name ||
                            profile.name,

                        role:
                            data.role ||
                            "client"

                    };


                    console.log(
                        "User Firestore profile loaded:",
                        profile
                    );

                }

                else {

                    console.warn(
                        `User not Found.`
                    );
                }

            }

            catch (error) {

                console.error(
                    "Failed to load users profile:",
                    error
                );

            }


            // =================================================
            // SAVE CURRENT PROFILE
            // =================================================

            currentClient =
                profile;


            // =================================================
            // UPDATE NAVBAR
            // =================================================

            updateNavbar(
                user,
                profile
            );

        }
    );

}


// ============================================================
// GET AUTHENTICATED CLIENT FOR ORDER
// ============================================================

export async function getAuthenticatedClient() {

    // --------------------------------------------------------
    // 1. Get the current Firebase Auth user
    // --------------------------------------------------------

    const user =
        currentUser ||
        getCurrentClient();


    if (!user) {

        return {
            authenticated: false,
            exists: false,
            user: null,
            client: null
        };

    }


    // --------------------------------------------------------
    // 2. Verify clients/{uid} exists
    // --------------------------------------------------------

    try {

        const clientRef =
            doc(
                db,
                "clients",
                user.uid
            );


        const snapshot =
            await getDoc(clientRef);


        // ----------------------------------------------------
        // Firestore document does not exist
        // ----------------------------------------------------

        if (!snapshot.exists()) {

            console.warn(
                "Client Firestore document not found:",
                `clients/${user.uid}`
            );


            return {
                authenticated: true,
                exists: false,
                user,
                client: null
            };

        }


        // ----------------------------------------------------
        // Client document exists
        // ----------------------------------------------------

        const data =
            snapshot.data();


        const client = {

            ...data,

            uid:
                data.uid ||
                user.uid,

            email:
                data.email ||
                user.email ||
                "",

            name:
                data.name ||
                user.displayName ||
                user.email?.split("@")[0] ||
                "Client",

            phone:
                data.phone ||
                "",

            address:
                data.address ||
                "",

            role:
                data.role ||
                "client"

        };
        
        // Keep module state synchronized

        currentUser =
            user;

        currentClient =
            client;


        return {

            authenticated: true,

            exists: true,

            user,

            client

        };

    }

    catch (error) {

        console.error(
            "Unable to verify client profile:",
            error
        );


        throw error;

    }

}


// ============================================================
// START
// ============================================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        console.log(
            "========================================"
        );

        console.log(
            "FGSHUSOFT CLIENT AUTH UI STARTING..."
        );

        console.log(
            "========================================"
        );


        if (
            !initializeAuthUI()
        ) {

            return;

        }


        initializeEvents();

        initializeAuthWatcher();


        // ----------------------------------------------------
        // IMPORTANT:
        // This only sets the FORM to login mode.
        // It does NOT mean the user is logged out.
        // ----------------------------------------------------

        setAuthMode(
            "login"
        );


        // ----------------------------------------------------
        // Check Firebase immediately.
        // This handles the case where Firebase has already
        // restored a previous login.
        // ----------------------------------------------------

        const restoredUser =
            getCurrentClient();


        if (restoredUser) {

            currentUser =
                restoredUser;


            updateNavbar(
                restoredUser
            );


            console.log(
                "Existing Firebase session restored:",
                restoredUser.email
            );

        }


        console.log(
            "FGSHUSOFT CLIENT AUTH UI READY."
        );

    }
);

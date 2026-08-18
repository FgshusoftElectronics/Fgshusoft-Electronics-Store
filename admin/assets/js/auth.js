
// =====================================================
// ADMIN LOGIN + FIRST LOGIN ONBOARDING
// =====================================================

import {
loginAdmin
} from "./firebase-auth.js";

import {
getGeneralSettings
} from "../../services/settings-service.js";

import {
db
} from "./firebase.js";

import {
collection,
doc,
getDoc,
getDocs,
serverTimestamp,
setDoc
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

// =====================================================
// DOM
// =====================================================

const form =
document.getElementById(
"loginForm"
);

const emailInput =
document.getElementById(
"email"
);

const passwordInput =
document.getElementById(
"password"
);

const rememberInput =
document.getElementById(
"rememberMe"
);

// =====================================================
// ADMINISTRATOR PERMISSIONS
// =====================================================

function getAdministratorPermissions() {

return {  

    dashboard: true,  

    products: true,  

    categories: true,  

    brands: true,  

    orders: true,  

    customers: true,  

    services: true,  

    training: true,  

    projects: true,  

    reports: true,  

    settings: true  

};

}

// =====================================================
// APPLICATION LOADER
// =====================================================

function updateLoader({

icon = "fa-shield-halved",  

title = "Secure Login",  

body = "Please wait...",  

progress = 0,  

footer = "Processing..."

}) {

const loader =  
    document.getElementById(  
        "loader"  
    );  

if (!loader) {  

    console.warn(  
        "Application loader not found."  
    );  

    return;  

}  


const iconElement =  
    document.getElementById(  
        "loaderIcon"  
    );  

const titleElement =  
    document.getElementById(  
        "loaderTitle"  
    );  

const bodyElement =  
    document.getElementById(  
        "loaderBody"  
    );  

const progressElement =  
    document.getElementById(  
        "loaderProgress"  
    );  

const progressText =  
    document.getElementById(  
        "loaderProgressText"  
    );  

const footerElement =  
    document.getElementById(  
        "loaderFooter"  
    );  

const progressWrapper =  
    document.querySelector(  
        ".loader-progress"  
    );  


loader.style.display =  
    "flex";  

loader.style.opacity =  
    "1";  

loader.style.visibility =  
    "visible";  

loader.style.pointerEvents =  
    "auto";  


if (iconElement) {  

    iconElement.className =  
        `fa-solid ${icon}`;  

}  


if (titleElement) {  

    titleElement.textContent =  
        title;  

}  


if (bodyElement) {  

    bodyElement.textContent =  
        body;  

}  


if (footerElement) {  

    footerElement.textContent =  
        footer;  

}  


const value =  
    Math.max(  
        0,  
        Math.min(  
            100,  
            Number(progress) || 0  
        )  
    );  


if (progressElement) {  

    progressElement.style.width =  
        `${value}%`;  

}  


if (progressText) {  

    progressText.textContent =  
        `${value}%`;  

}  


if (progressWrapper) {  

    progressWrapper.setAttribute(  
        "aria-valuenow",  
        value  
    );  

}

}

// =====================================================
// HIDE LOADER
// =====================================================

function hideLoader(
delay = 0
) {

const loader =  
    document.getElementById(  
        "loader"  
    );  


if (!loader) {  

    return;  

}  


setTimeout(  
    () => {  

        loader.style.opacity =  
            "0";  

        loader.style.visibility =  
            "hidden";  

        loader.style.pointerEvents =  
            "none";  


        setTimeout(  
            () => {  

                loader.style.display =  
                    "none";  

            },  
            400  
        );  

    },  
    delay  
);

}

// =====================================================
// SHOW LOADER AGAIN
// =====================================================

function showLoader() {

const loader =  
    document.getElementById(  
        "loader"  
    );  


if (!loader) {  

    return;  

}  


loader.style.display =  
    "flex";  

loader.style.opacity =  
    "1";  

loader.style.visibility =  
    "visible";  

loader.style.pointerEvents =  
    "auto";

}

// =====================================================
// ALERT HELPER
// =====================================================

function showAlert(
icon,
title,
text,
options = {}
) {

if (  
    typeof Swal !== "undefined"  
) {  

    return Swal.fire({  

        icon,  

        title,  

        text,  

        ...options  

    });  

}  


alert(  
    `${title}\n\n${text}`  
);

}

// =====================================================
// LOAD COMPANY BRANDING
// =====================================================

async function loadCompanyBranding() {

try {  

    updateLoader({  

        icon:  
            "fa-building",  

        title:  
            "Company Branding",  

        body:  
            "Loading company identity...",  

        progress:  
            20,  

        footer:  
            "Preparing your login environment..."  

    });  


    const settings =  
        await getGeneralSettings();  


    const companyName =  
        settings?.companyName ||  
        settings?.businessName ||  
        settings?.siteName ||  
        settings?.name ||  
        "Fgshusoft Electronics";  


    const companyLogo =  
        settings?.companyLogo ||  
        settings?.logo ||  
        settings?.logoUrl ||  
        "";  


    document  
        .querySelectorAll(  
            "[data-company-name]"  
        )  
        .forEach(  
            element => {  

                element.textContent =  
                    companyName;  

            }  
        );  


    document  
        .querySelectorAll(  
            "[data-company-logo]"  
        )  
        .forEach(  
            logo => {  

                if (companyLogo) {  

                    logo.src =  
                        companyLogo;  

                    logo.alt =  
                        `${companyName} logo`;  

                    logo.classList.remove(  
                        "d-none"  
                    );  

                }  
                else {  

                    logo.removeAttribute(  
                        "src"  
                    );  

                    logo.classList.add(  
                        "d-none"  
                    );  

                }  

            }  
        );  


    document  
        .querySelectorAll(  
            "[data-company-copyright]"  
        )  
        .forEach(  
            element => {  

                element.textContent =  
                    `© ${new Date().getFullYear()} ${companyName}. All rights reserved.`;  

            }  
        );  


    return {  

        companyName,  

        companyLogo  

    };  

}  
catch (error) {  

    console.warn(  
        "Could not load company branding:",  
        error  
    );  


    const companyName =  
        "Fgshusoft Electronics";  


    document  
        .querySelectorAll(  
            "[data-company-name]"  
        )  
        .forEach(  
            element => {  

                element.textContent =  
                    companyName;  

            }  
        );  


    document  
        .querySelectorAll(  
            "[data-company-copyright]"  
        )  
        .forEach(  
            element => {  

                element.textContent =  
                    `© ${new Date().getFullYear()} ${companyName}. All rights reserved.`;  

            }  
        );  


    return {  

        companyName,  

        companyLogo: ""  

    };  

}

}

// =====================================================
// REMEMBERED EMAIL
// =====================================================

function loadRememberedEmail() {

try {  

    updateLoader({  

        icon:  
            "fa-envelope",  

        title:  
            "Remembered Account",  

        body:  
            "Restoring your saved login information...",  

        progress:  
            40,  

        footer:  
            "Checking your browser preferences..."  

    });  


    const remembered =  
        localStorage.getItem(  
            "fgshusoft_remember_email"  
        );  


    if (  
        remembered &&  
        emailInput  
    ) {  

        emailInput.value =  
            remembered;  


        if (rememberInput) {  

            rememberInput.checked =  
                true;  

        }  

    }  

}  
catch (error) {  

    console.warn(  
        "Could not load remembered email:",  
        error  
    );  

}

}

// =====================================================
// SAVE REMEMBERED EMAIL
// =====================================================

function saveRememberedEmail() {

if (!emailInput) {  

    return;  

}  


try {  

    if (  
        rememberInput?.checked  
    ) {  

        localStorage.setItem(  

            "fgshusoft_remember_email",  

            emailInput.value.trim()  

        );  

    }  
    else {  

        localStorage.removeItem(  
            "fgshusoft_remember_email"  
        );  

    }  

}  
catch (error) {  

    console.warn(  
        "Could not save remembered email:",  
        error  
    );  

}

}

// =====================================================
// CREATE FIRST LOGIN MODAL
// =====================================================

function createFirstLoginModal() {

let modal =  
    document.getElementById(  
        "firstLoginModal"  
    );  


if (modal) {  

    return modal;  

}  


modal =  
    document.createElement(  
        "div"  
    );  


modal.id =  
    "firstLoginModal";  


modal.className =  
    "modal fade";  


modal.tabIndex =  
    -1;  


modal.setAttribute(  
    "aria-labelledby",  
    "firstLoginModalTitle"  
);  


modal.setAttribute(  
    "aria-hidden",  
    "true"  
);  


modal.innerHTML = `  

    <div class="modal-dialog modal-dialog-centered modal-lg">  

        <div class="modal-content border-0 shadow-lg rounded-4 overflow-hidden">  


            <!-- =============================================  
                 HEADER  
            ============================================== -->  

            <div class="modal-header bg-primary text-white border-0">  

                <div>  

                    <h5  
                        class="modal-title fw-bold"  
                        id="firstLoginModalTitle"  
                    >  

                        <i class="fa-solid fa-user-plus me-2"></i>  

                        Complete Your Account  

                    </h5>  


                    <small class="opacity-75">  

                        First-time account setup  

                    </small>  

                </div>  


            </div>  


            <!-- =============================================  
                 BODY  
            ============================================== -->  

            <div class="modal-body p-4">  


                <div  
                    class="alert alert-info d-flex align-items-start gap-3"  
                >  

                    <i  
                        class="fa-solid fa-circle-info mt-1"  
                    ></i>  


                    <div>  

                        <strong>  
                            Welcome!  
                        </strong>  

                        <div class="small mt-1">  

                            Your authentication account is valid,  
                            but your Control Center profile has not  
                            been created yet.  

                            Please complete this form before  
                            continuing.  

                        </div>  

                    </div>  

                </div>  


                <form  
                    id="firstLoginForm"  
                    novalidate  
                >  


                    <div class="row g-3">  


                        <!-- NAME -->  

                        <div class="col-md-6">  

                            <label  
                                for="firstLoginName"  
                                class="form-label fw-semibold"  
                            >  

                                Full Name  
                                <span class="text-danger">*</span>  

                            </label>  


                            <div class="input-group">  

                                <span class="input-group-text">  

                                    <i class="fa-solid fa-user"></i>  

                                </span>  


                                <input  
                                    type="text"  
                                    id="firstLoginName"  
                                    name="name"  
                                    class="form-control"  
                                    placeholder="Enter your full name"  
                                    autocomplete="name"  
                                    required  
                                >  

                            </div>  

                        </div>  


                        <!-- PHONE -->  

                        <div class="col-md-6">  

                            <label  
                                for="firstLoginPhone"  
                                class="form-label fw-semibold"  
                            >  

                                Phone Number  

                            </label>  


                            <div class="input-group">  

                                <span class="input-group-text">  

                                    <i class="fa-solid fa-phone"></i>  

                                </span>  


                                <input  
                                    type="tel"  
                                    id="firstLoginPhone"  
                                    name="phone"  
                                    class="form-control"  
                                    placeholder="Enter phone number"  
                                    autocomplete="tel"  
                                >  

                            </div>  

                        </div>  


                        <!-- EMAIL -->  

                        <div class="col-12">  

                            <label  
                                class="form-label fw-semibold"  
                            >  

                                Email Address  

                            </label>  


                            <div class="input-group">  

                                <span class="input-group-text">  

                                    <i class="fa-solid fa-envelope"></i>  

                                </span>  


                                <input  
                                    type="email"  
                                    id="firstLoginEmail"  
                                    class="form-control"  
                                    readonly  
                                >  

                            </div>  


                            <div class="form-text">  

                                This is the authenticated account email.  

                            </div>  

                        </div>  


                        <!-- ROLE -->  

                        <div class="col-md-6">  

                            <label  
                                for="firstLoginRole"  
                                class="form-label fw-semibold"  
                            >  

                                Account Role  

                            </label>  


                            <select  
                                id="firstLoginRole"  
                                class="form-select"  
                                disabled  
                            >  

                                <option  
                                    value="administrator"  
                                >  

                                    Administrator  

                                </option>  

                            </select>  


                            <div class="form-text">  

                                The first Control Center account  
                                is automatically assigned administrator access.  

                            </div>  

                        </div>  


                        <!-- ACCOUNT TYPE -->  

                        <div class="col-md-6">  

                            <label  
                                class="form-label fw-semibold"  
                            >  

                                Account Type  

                            </label>  


                            <input  
                                type="text"  
                                class="form-control"  
                                value="Administrator"  
                                readonly  
                            >  

                        </div>  


                        <!-- SECURITY NOTICE -->  

                        <div class="col-12">  

                            <div  
                                class="border rounded-3 p-3 bg-light"  
                            >  

                                <div  
                                    class="d-flex align-items-start gap-3"  
                                >  

                                    <i  
                                        class="fa-solid fa-shield-halved text-primary mt-1"  
                                    ></i>  


                                    <div>  

                                        <strong>  
                                            Full administrator access  
                                        </strong>  


                                        <div class="small text-muted mt-1">  

                                            As the first user, you will  
                                            receive full access to the  
                                            Control Center, including  
                                            Settings where you can later  
                                            create managers, staff and  
                                            sales accounts.  

                                        </div>  

                                    </div>  

                                </div>  

                            </div>  

                        </div>  


                    </div>  


                    <!-- FORM ERROR -->  

                    <div  
                        id="firstLoginError"  
                        class="alert alert-danger d-none mt-3"  
                    ></div>  


                    <!-- SUBMIT -->  

                    <div class="d-flex justify-content-end mt-4">  

                        <button  
                            type="submit"  
                            id="firstLoginSubmit"  
                            class="btn btn-primary px-4"  
                        >  

                            <i  
                                class="fa-solid fa-user-check me-2"  
                            ></i>  

                            Complete Account Setup  

                        </button>  

                    </div>  


                </form>  


            </div>  

        </div>  

    </div>  

`;  


document.body.appendChild(  
    modal  
);  


return modal;

}

// =====================================================
// FIRST LOGIN MODAL INSTANCE
// =====================================================

let firstLoginModalInstance =
null;

// =====================================================
// OPEN FIRST LOGIN MODAL
// =====================================================

async function openFirstLoginModal(
user
) {

const modalElement =  
    createFirstLoginModal();  


const firstLoginForm =  
    document.getElementById(  
        "firstLoginForm"  
    );  


if (!firstLoginForm) {  

    throw new Error(  
        "Unable to create first-login form."  
    );  

}  


const nameInput =  
    document.getElementById(  
        "firstLoginName"  
    );  

const phoneInput =  
    document.getElementById(  
        "firstLoginPhone"  
    );  

const emailDisplay =  
    document.getElementById(  
        "firstLoginEmail"  
    );  


if (emailDisplay) {  

    emailDisplay.value =  
        user.email ||  
        "";  

}  


if (nameInput) {  

    nameInput.value =  
        user.displayName ||  
        "";  

}  


// -------------------------------------------------  
// BOOTSTRAP MODAL  
// -------------------------------------------------  

if (  
    typeof bootstrap === "undefined" ||  
    !bootstrap.Modal  
) {  

    throw new Error(  
        "Bootstrap Modal is not available on login.html."  
    );  

}  


firstLoginModalInstance =  
    bootstrap.Modal.getOrCreateInstance(  
        modalElement,  
        {  
            backdrop:  
                "static",  

            keyboard:  
                false  
        }  
    );  


firstLoginModalInstance.show();  


// -------------------------------------------------  
// FOCUS  
// -------------------------------------------------  

setTimeout(  
    () => {  

        nameInput?.focus();  

    },  
    400  
);  


// -------------------------------------------------  
// FORM HANDLER  
// -------------------------------------------------  

return new Promise(  
    resolve => {  

        firstLoginForm.onsubmit =  
            async event => {  

                event.preventDefault();  


                const errorElement =  
                    document.getElementById(  
                        "firstLoginError"  
                    );  


                const submitButton =  
                    document.getElementById(  
                        "firstLoginSubmit"  
                    );  


                const name =  
                    nameInput  
                        ?.value  
                        ?.trim();  


                const phone =  
                    phoneInput  
                        ?.value  
                        ?.trim() ||  
                    "";  


                // -------------------------------------  
                // VALIDATION  
                // -------------------------------------  

                if (!name) {  

                    if (errorElement) {  

                        errorElement.textContent =  
                            "Please enter your full name.";  

                        errorElement.classList.remove(  
                            "d-none"  
                        );  

                    }  


                    nameInput?.focus();  

                    return;  

                }  


                if (errorElement) {  

                    errorElement.textContent =  
                        "";  

                    errorElement.classList.add(  
                        "d-none"  
                    );  

                }  


                if (submitButton) {  

                    submitButton.disabled =  
                        true;  


                    submitButton.innerHTML = `  

                        <span  
                            class="spinner-border  
                                   spinner-border-sm  
                                   me-2"  
                        ></span>  

                        Creating profile...  

                    `;  

                }  


                try {  

                    const profile =  
                        await createFirstAdministrator(  
                            user,  
                            {  
                                name,  
                                phone  
                            }  
                        );  


                    firstLoginModalInstance?.hide();  


                    resolve(  
                        profile  
                    );  

                }  
                catch (error) {  

                    console.error(  
                        "First login profile creation failed:",  
                        error  
                    );  


                    if (errorElement) {  

                        errorElement.textContent =  
                            error?.message ||  
                            "Unable to create your profile.";  

                        errorElement.classList.remove(  
                            "d-none"  
                        );  

                    }  


                    if (submitButton) {  

                        submitButton.disabled =  
                            false;  


                        submitButton.innerHTML = `  

                            <i  
                                class="fa-solid fa-user-check me-2"  
                            ></i>  

                            Complete Account Setup  

                        `;  

                    }  

                }  

            };  

    }  
);

}

// =====================================================
// CREATE FIRST ADMINISTRATOR
// =====================================================

async function createFirstAdministrator(
user,
formData
) {

updateLoader({  

    icon:  
        "fa-user-shield",  

    title:  
        "Administrator Setup",  

    body:  
        "Creating your administrator profile...",  

    progress:  
        78,  

    footer:  
        "Configuring full Control Center permissions..."  

});  


const userRef =  
    doc(  
        db,  
        "users",  
        user.uid  
    );  


// -------------------------------------------------  
// DOUBLE CHECK CURRENT USER  
// -------------------------------------------------  

const currentSnapshot =  
    await getDoc(  
        userRef  
    );  


if (  
    currentSnapshot.exists()  
) {  

    return currentSnapshot.data();  

}  


// -------------------------------------------------  
// CHECK WHETHER A USER PROFILE ALREADY EXISTS  
// -------------------------------------------------  

const usersSnapshot =  
    await getDocs(  
        collection(  
            db,  
            "users"  
        )  
    );  


// -------------------------------------------------  
// ONLY FIRST USER CAN BECOME ADMINISTRATOR  
// -------------------------------------------------  

if (!usersSnapshot.empty) {  

    throw new Error(  

        "Your authentication account exists, but no Control Center profile is assigned to it. Please contact an administrator."  

    );  

}  


const displayName =  
    formData?.name ||  
    user.displayName ||  
    user.email ||  
    "Administrator";  


const email =  
    user.email ||  
    "";  


const phone =  
    formData?.phone ||  
    "";  


const permissions =  
    getAdministratorPermissions();  


const userProfile = {  

    uid:  
        user.uid,  


    name:  
        displayName,  


    displayName:  
        displayName,  


    email:  
        email,  


    phone:  
        phone,  


    role:  
        "administrator",  


    permissions:  
        permissions,  


    dashboardAccess:  
        true,  


    active:  
        true,  


    accountType:  
        "administrator",  


    isFirstUser:  
        true,  


    createdBy:  
        user.uid,  


    createdByName:  
        displayName,  


    createdByEmail:  
        email,  


    createdAt:  
        serverTimestamp(),  


    updatedAt:  
        serverTimestamp()  

};  


// -------------------------------------------------  
// CREATE PROFILE  
// -------------------------------------------------  

await setDoc(  
    userRef,  
    userProfile  
);  


console.log(  
    "First administrator profile created:",  
    userProfile  
);  


updateLoader({  

    icon:  
        "fa-circle-check",  

    title:  
        "Administrator Created",  

    body:  
        "Your administrator profile has been created successfully.",  

    progress:  
        90,  

    footer:  
        "Full Control Center permissions granted."  

});  


return userProfile;

}

// =====================================================
// ENSURE USER PROFILE
// =====================================================

async function ensureUserProfile(
user
) {

if (!user) {  

    throw new Error(  
        "No authenticated user was returned."  
    );  

}  


updateLoader({  

    icon:  
        "fa-database",  

    title:  
        "Account Profile",  

    body:  
        "Checking your Control Center profile...",  

    progress:  
        68,  

    footer:  
        "Synchronizing your account..."  

});  


const userRef =  
    doc(  
        db,  
        "users",  
        user.uid  
    );  


const snapshot =  
    await getDoc(  
        userRef  
    );  


if (  
    snapshot.exists()  
) {  

    const profile =  
        snapshot.data();  


    console.log(  
        "Existing user profile:",  
        profile  
    );  


    return {  

        exists:  
            true,  

        profile:  
            profile  

    };  

}  


// -------------------------------------------------  
// NO PROFILE  
// -------------------------------------------------  

console.log(  
    "No user profile found. Starting onboarding..."  
);  


return {  

    exists:  
        false,  

    profile:  
        null  

};

}


// =====================================================
// CHECK WHETHER CONTROL CENTER HAS ANY USERS
// =====================================================

async function isFirstControlCenterUser() {

    try {

        const usersSnapshot =
            await getDocs(
                collection(
                    db,
                    "users"
                )
            );

        return usersSnapshot.empty;

    }
    catch (error) {

        console.error(
            "Failed to check Control Center users:",
            error
        );

        throw new Error(
            "Unable to verify the Control Center user database."
        );

    }

}

// =====================================================
// PREPARE LOGIN FORM
// =====================================================

async function initializeLoginPage() {

try {  

    updateLoader({  

        icon:  
            "fa-shield-halved",  

        title:  
            "Secure Login",  

        body:  
            "Preparing secure authentication...",  

        progress:  
            5,  

        footer:  
            "Initializing login environment..."  

    });  


    await loadCompanyBranding();  


    loadRememberedEmail();  


    updateLoader({  

        icon:  
            "fa-right-to-bracket",  

        title:  
            "Login Ready",  

        body:  
            "Your secure login form is ready.",  

        progress:  
            75,  

        footer:  
            "Enter your credentials to continue..."  

    });  


    await new Promise(  
        resolve =>  
            setTimeout(  
                resolve,  
                400  
            )  
    );  


    updateLoader({  

        icon:  
            "fa-circle-check",  

        title:  
            "Ready",  

        body:  
            "Secure login is ready.",  

        progress:  
            100,  

        footer:  
            "You may now sign in."  

    });  


    if (form) {  

        form.classList.add(  
            "login-ready"  
        );  

    }  


    hideLoader(  
        600  
    );  

}  
catch (error) {  

    console.error(  
        "Login page initialization failed:",  
        error  
    );  


    if (form) {  

        form.classList.add(  
            "login-ready"  
        );  

    }  


    updateLoader({  

        icon:  
            "fa-triangle-exclamation",  

        title:  
            "Login Ready",  

        body:  
            "Some startup information could not be loaded.",  

        progress:  
            100,  

        footer:  
            "You can still continue."  

    });  


    hideLoader(  
        1000  
    );  

}

}

// =====================================================
// LOGIN
// =====================================================

if (form) {

form.addEventListener(  
    "submit",  
    async event => {  

        event.preventDefault();  


        const email =  
            emailInput  
                ?.value  
                ?.trim();  


        const password =  
            passwordInput  
                ?.value  
                ?.trim();  


        const button =  
            document.querySelector(  
                "#loginButton"  
            );  


        if (  
            !email ||  
            !password  
        ) {  

            await showAlert(  

                "warning",  

                "Missing Information",  

                "Please enter your email and password."  

            );  

            return;  

        }  


        saveRememberedEmail();  


        const oldContent =  
            button?.innerHTML;  


        if (button) {  

            button.disabled =  
                true;  


            button.innerHTML = `  

                <span  
                    class="spinner-border  
                           spinner-border-sm  
                           me-2"  
                ></span>  

                Signing in...  

            `;  

        }  


        try {  

            // =================================================  
            // AUTHENTICATION  
            // =================================================  

            updateLoader({  

                icon:  
                    "fa-user-shield",  

                title:  
                    "Authentication",  

                body:  
                    "Verifying your email and password...",  

                progress:  
                    20,  

                footer:  
                    "Connecting securely to Firebase..."  

            });  


            const result =  
                await loginAdmin(  
                    email,  
                    password  
                );  


            const user =  
                result?.user;  


            if (!user) {  

                throw new Error(  
                    "Authentication succeeded but no user account was returned."  
                );  

            }  


            console.log(  
                "Authenticated user:",  
                user  
            );  


            // =================================================  
            // CHECK PROFILE  
            // =================================================  

            updateLoader({  

                icon:  
                    "fa-database",  

                title:  
                    "Checking Account",  

                body:  
                    "Checking your Control Center profile...",  

                progress:  
                    55,  

                footer:  
                    "Looking for your user profile..."  

            });  


            let resultProfile =  
                await ensureUserProfile(  
                    user  
                );  


            let profile =  
                resultProfile.profile;  


// =================================================
// PROFILE MISSING
// =================================================

if (!resultProfile.exists) {

    console.log(
        "Authenticated user has no Control Center profile."
    );


    // =================================================
    // CHECK WHETHER THIS IS THE FIRST CONTROL CENTER USER
    // =================================================

    updateLoader({

        icon:
            "fa-users",

        title:
            "Checking Control Center",

        body:
            "Checking whether the Control Center has been initialized...",

        progress:
            65,

        footer:
            "Verifying existing administrator accounts..."

    });


    const firstUser =
        await isFirstControlCenterUser();


    // =================================================
    // FIRST USER
    // =================================================

    if (firstUser) {

        console.log(
            "No Control Center users found. Starting first-user onboarding..."
        );


        updateLoader({

            icon:
                "fa-user-plus",

            title:
                "First Administrator",

            body:
                "No Control Center administrator exists yet.",

            progress:
                70,

            footer:
                "Please complete your administrator account..."

        });


        // -------------------------------------------------
        // HIDE LOADER FOR MODAL
        // -------------------------------------------------

        hideLoader(
            200
        );


        // -------------------------------------------------
        // OPEN FIRST USER ONBOARDING
        // -------------------------------------------------

        profile =
            await openFirstLoginModal(
                user
            );


        // -------------------------------------------------
        // VERIFY PROFILE CREATION
        // -------------------------------------------------

        if (!profile) {

            throw new Error(
                "Your administrator profile could not be created."
            );

        }


        console.log(
            "First administrator onboarding completed:",
            profile
        );


        // -------------------------------------------------
        // SHOW LOADER AGAIN
        // -------------------------------------------------

        showLoader();


        updateLoader({

            icon:
                "fa-circle-check",

            title:
                "Administrator Created",

            body:
                "Your administrator profile has been created successfully.",

            progress:
                88,

            footer:
                "Preparing your Control Center..."

        });

    }


    // =================================================
    // NOT THE FIRST USER
    // =================================================

    else {

        console.warn(
            "User authenticated successfully but has no Control Center profile."
        );


        throw new Error(

            "Sorry, you are not registered in the Control Center. Please contact an administrator."

        );

    }

}

            // =================================================  
            // ACCOUNT STATUS  
            // =================================================  

            if (  
                profile.active === false  
            ) {  

                throw new Error(  
                    "Your account has been disabled. Please contact an administrator."  
                );  

            }  


            // =================================================  
            // DASHBOARD ACCESS  
            // =================================================  

            if (  
                profile.dashboardAccess === false  
            ) {  

                throw new Error(  
                    "Your account does not currently have dashboard access."  
                );  

            }  


            // =================================================  
            // PREPARE WORKSPACE  
            // =================================================  

            const displayName =  
                profile.displayName ||  
                profile.name ||  
                user.displayName ||  
                user.email ||  
                email;  


            updateLoader({  

                icon:  
                    "fa-building",  

                title:  
                    "Preparing Workspace",  

                body:  
                    `Preparing the Control Center for ${displayName}...`,  

                progress:  
                    94,  

                footer:  
                    "Almost ready..."  

            });  


            await new Promise(  
                resolve =>  
                    setTimeout(  
                        resolve,  
                        400  
                    )  
            );  


            // =================================================  
            // COMPLETE  
            // =================================================  

            updateLoader({  

                icon:  
                    "fa-circle-check",  

                title:  
                    "Welcome",  

                body:  
                    `Welcome ${displayName}. Your Control Center is ready.`,  

                progress:  
                    100,  

                footer:  
                    "Redirecting to your dashboard..."  

            });  


            await showAlert(  

                "success",  

                "Welcome",  

                `Login successful. Welcome ${displayName}!`,  

                {  

                    timer:  
                        1200,  

                    timerProgressBar:  
                        true,  

                    showConfirmButton:  
                        false  

                }  

            );  


            // =================================================  
            // REDIRECT  
            // =================================================  

            window.location.href =  
                "index.html";  

        }  
        catch (error) {  

            console.error(  
                "Login error:",  
                error  
            );  


            let message =  
                "Unable to login.";  


            switch (  
                error?.code  
            ) {  

                case "auth/invalid-email":  

                    message =  
                        "Invalid email format.";  

                    break;  


                case "auth/user-not-found":  

                    message =  
                        "No account was found with this email.";  

                    break;  


                case "auth/wrong-password":  

                    message =  
                        "Incorrect password.";  

                    break;  


                case "auth/invalid-credential":  

                    message =  
                        "Invalid email or password.";  

                    break;  


                case "auth/too-many-requests":  

                    message =  
                        "Too many login attempts. Please try again later.";  

                    break;  


                case "auth/network-request-failed":  

                    message =  
                        "Network error. Please check your Internet connection.";  

                    break;  


                default:  

                    message =  
                        error?.message ||  
                        "An unexpected error occurred.";  

            }  


            // -------------------------------------------------  
            // RESET LOADER  
            // -------------------------------------------------  

            const loader =  
                document.getElementById(  
                    "loader"  
                );  


            if (loader) {  

                loader.style.display =  
                    "none";  

                loader.style.opacity =  
                    "1";  

                loader.style.visibility =  
                    "visible";  

                loader.style.pointerEvents =  
                    "auto";  

            }  


            await showAlert(  

                "error",  

                "Login Failed",  

                message  

            );  

        }  
        finally {  

            if (button) {  

                button.disabled =  
                    false;  


                button.innerHTML =  
                    oldContent;  

            }  

        }  

    }  
);

}

// =====================================================
// PASSWORD VISIBILITY
// =====================================================

const togglePassword =
document.getElementById(
"togglePassword"
);

const togglePasswordIcon =
document.getElementById(
"togglePasswordIcon"
);

if (togglePassword) {

togglePassword.addEventListener(  
    "click",  
    () => {  

        if (!passwordInput) {  

            return;  

        }  


        const showing =  
            passwordInput.type ===  
            "text";  


        passwordInput.type =  
            showing  
                ? "password"  
                : "text";  


        if (togglePasswordIcon) {  

            togglePasswordIcon.className =  
                showing  
                    ? "fa-solid fa-eye"  
                    : "fa-solid fa-eye-slash";  

        }  


        togglePassword.setAttribute(  
            "aria-label",  
            showing  
                ? "Show password"  
                : "Hide password"  
        );  


        togglePassword.setAttribute(  
            "title",  
            showing  
                ? "Show password"  
                : "Hide password"  
        );  

    }  
);

}

// =====================================================
// START LOGIN PAGE
// =====================================================

initializeLoginPage();

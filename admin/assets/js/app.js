import { checkAuth } from "./firebase-auth.js";

import {
    loadSidebar,
    loadTopbar,
    loadFooter
} from "./ui.js";

import { navigate } from "./router.js";

import {
    loadAdminEmail
} from "./profile.js";

import {
    lockSidebar,
    initSidebarSecurity,
    initSecurityModal,
    loadSidebarSecuritySettings
} from "./sidebar-security.js";

import {
    initSidebarToggle
} from "./topbar-collapse.js";

import {
    loadAccessSettings,
    applyAccessControl,
    applyDashboardAccess,
    getDefaultModule
} from "./access-control.js";

import {
    applySavedAppearance
} from "./appearance.js";

import {
    showLoader,
    updateLoader,
    hideLoader
} from "./loader.js";

import {
    getGeneralSettings
} from "../../services/settings-service.js";

import {
    loadCompanyProfile
} from "./company-profile.js";

import {
loadSidebarCounts
} from "./sidebar-counts.js";


// =====================================================
// GLOBAL DEFAULT PAGE NAVIGATION
// =====================================================

window.goToDashboard = async function(){

    try{
        const defaultModule =
            getDefaultModule();

        console.log(
            "Navigating to default module:",
            defaultModule
        );

        await navigate(
            defaultModule
        );

    }
    catch(error){

        console.error(
            "Failed to return to default page:",
            error
        );

    }

};

function getElement(id) {
    return document.getElementById(id);
}

async function applyCompanyBranding(){
    try{
const settings = await getGeneralSettings() || {};

    const companyName =
        settings.companyName ||
        settings.businessName ||
        "Fgshusoft Electronics";


    const companyLogo =
        settings.companyLogo ||
        settings.logo ||
        "";


    // ---------------------------------------------
    // SIDEBAR COMPANY NAME
    // ---------------------------------------------

    const sidebarName =
        getElement(
            "sidebarCompanyName"
        );


if(sidebarName){
sidebarName.textContent =
            companyName;
} 

const sidebarLogo =
getElement( "sidebarCompanyLogo"
        );
if(sidebarLogo && companyLogo){
sidebarLogo.src = companyLogo;
sidebarLogo.alt = `${companyName} Logo`;
    }

    // ---------------------------------------------
    // OPTIONAL: OTHER COMPANY-NAME ELEMENTS
    // ---------------------------------------------

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


    // ---------------------------------------------
    // OPTIONAL: DOCUMENT TITLE
    // ---------------------------------------------

    if(companyName){
document.title = `${companyName} — Admin`;
    }
}catch(e){
    alert(e.message);
}
}


// =====================================================
// APPLICATION INITIALIZATION
// =====================================================

window.addEventListener(
    "DOMContentLoaded",
    async () => {

        showLoader();

try {

    // =====================================================
    // APPLICATION INITIALIZATION
    // =====================================================


    // -----------------------------------------------------
    // 1. AUTHENTICATION
    // -----------------------------------------------------

    updateLoader({
        icon: "fa-user-shield",
        title: "Authentication",
        body: "Verifying your account and session...",
        progress: 5,
        footer: "Checking secure credentials..."
    });

    await checkAuth();


    // -----------------------------------------------------
    // 2. ACCESS CONTROL
    // -----------------------------------------------------

    updateLoader({
        icon: "fa-shield-halved",
        title: "Access Control",
        body: "Loading permissions and access settings...",
        progress: 15,
        footer: "Securing your workspace..."
    });

    await loadAccessSettings();


    // -----------------------------------------------------
    // 3. SIDEBAR
    // -----------------------------------------------------

    updateLoader({
        icon: "fa-bars",
        title: "Navigation",
        body: "Loading dashboard navigation...",
        progress: 25,
        footer: "Preparing your workspace..."
    });

    await loadSidebar();

updateLoader({
    icon: "fa-chart-simple",
    title: "Dashboard Statistics",
    body: "Loading navigation counters...",
    progress: 28,
    footer: "Synchronizing your workspace..."
});

await loadSidebarCounts();

    // -----------------------------------------------------
    // 4. COMPANY BRANDING
    // -----------------------------------------------------

    updateLoader({
        icon: "fa-building",
        title: "Company Branding",
        body: "Applying company identity and branding...",
        progress: 32,
        footer: "Personalizing your dashboard..."
    });

    await applyCompanyBranding();


    // -----------------------------------------------------
    // 5. TOPBAR
    // -----------------------------------------------------
    //
    // IMPORTANT:
    // The company profile modal is now located in the
    // main index/topbar area, so load the Topbar BEFORE
    // initializing the company profile controller.
    // -----------------------------------------------------

    updateLoader({
        icon: "fa-window-maximize",
        title: "Dashboard Interface",
        body: "Preparing the dashboard header...",
        progress: 42,
        footer: "Loading interface components..."
    });

    await loadTopbar();


    // -----------------------------------------------------
    // 6. COMPANY PROFILE
    // -----------------------------------------------------
    //
    // Topbar/index HTML now exists, so the company profile
    // controller can safely find its modal elements.
    // -----------------------------------------------------

    updateLoader({
        icon: "fa-building",
        title: "Company Profile",
        body: "Loading company information...",
        progress: 48,
        footer: "Preparing your company workspace..."
    });

    await loadCompanyProfile();


    // -----------------------------------------------------
    // 7. FOOTER
    // -----------------------------------------------------

    updateLoader({
        icon: "fa-layer-group",
        title: "Dashboard Interface",
        body: "Loading dashboard footer...",
        progress: 54,
        footer: "Finalizing interface..."
    });

    await loadFooter();


    // -----------------------------------------------------
    // 8. APPLY PERMISSIONS
    // -----------------------------------------------------
    //
    // IMPORTANT:
    // Sidebar HTML must already exist before this runs.
    // -----------------------------------------------------

    updateLoader({
        icon: "fa-user-lock",
        title: "Permissions",
        body: "Applying your account permissions...",
        progress: 61,
        footer: "Configuring available modules..."
    });

    applyAccessControl();


    // -----------------------------------------------------
    // 9. SIDEBAR SECURITY
    // -----------------------------------------------------

    updateLoader({
        icon: "fa-lock",
        title: "Security",
        body: "Applying sidebar security settings...",
        progress: 68,
        footer: "Protecting restricted areas..."
    });

    await loadSidebarSecuritySettings();


    // -----------------------------------------------------
    // 10. INITIALIZE SECURITY CONTROLS
    // -----------------------------------------------------

    updateLoader({
        icon: "fa-shield-halved",
        title: "Security",
        body: "Initializing security controls...",
        progress: 73,
        footer: "Security configuration is almost ready..."
    });

    initSidebarSecurity();

    initSecurityModal();


    // -----------------------------------------------------
    // 11. SIDEBAR CONTROLS
    // -----------------------------------------------------

    updateLoader({
        icon: "fa-bars-staggered",
        title: "Navigation",
        body: "Initializing sidebar controls...",
        progress: 78,
        footer: "Preparing navigation..."
    });

    initSidebarToggle();


    // -----------------------------------------------------
    // 12. APPEARANCE
    // -----------------------------------------------------

    updateLoader({
        icon: "fa-palette",
        title: "Appearance",
        body: "Applying saved theme and display preferences...",
        progress: 84,
        footer: "Personalizing your experience..."
    });

    await applySavedAppearance();


    // -----------------------------------------------------
    // 13. ADMIN INFORMATION
    // -----------------------------------------------------

    updateLoader({
        icon: "fa-id-badge",
        title: "User Profile",
        body: "Loading administrator information...",
        progress: 89,
        footer: "Preparing your account..."
    });

    loadAdminEmail();

    // -----------------------------------------------------
    // 14. DETERMINE INITIAL MODULE
    // -----------------------------------------------------

    const defaultModule =
        getDefaultModule();


    console.log(
        "Initial module:",
        defaultModule
    );


    // -----------------------------------------------------
    // 15. OPEN INITIAL MODULE
    // -----------------------------------------------------

    updateLoader({
        icon: "fa-compass",
        title: "Workspace",
        body: `Opening ${defaultModule}...`,
        progress: 94,
        footer: "Loading your default workspace..."
    });


    await navigate(
        defaultModule
    );


    // -----------------------------------------------------
    // 16. APPLICATION READY
    // -----------------------------------------------------

    updateLoader({
        icon: "fa-circle-check",
        title: "Welcome Back",
        body: "Your Control Center is ready.",
        progress: 100,
        footer: "Initialization complete."
    });


    // Give the user a moment to see the completed state.
    setTimeout(
        hideLoader,
        800
    );


}
catch (error) {

    // =====================================================
    // INITIALIZATION ERROR
    // =====================================================

    console.error(
        "Application initialization failed:",
        error
    );


    updateLoader({
        icon: "fa-circle-exclamation",
        title: "Initialization Failed",
        body: error?.message ||
              "Unable to initialize the Control Center.",
        progress: 100,
        footer: "Please refresh the page and try again."
    });
    
            window.location.href =
                "login.html";
            return;

}
/*
        catch(error){

            console.error(
                "Dashboard initialization error:",
                error
            );

            window.location.href =
                "login.html";
            return;

        }
*/
        hideLoader();

    }
);


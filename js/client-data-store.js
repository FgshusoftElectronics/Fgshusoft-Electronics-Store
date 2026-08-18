// =========================================================
// FGSHUSOFT ELECTRONICS
// CLIENT APPLICATION
// client-data-store.js
// =========================================================
//
// Centralized real-time client data store.
//
// Firestore -> onSnapshot() -> local arrays -> application
//
// The rest of the client application should READ from these
// local arrays instead of querying Firestore repeatedly.
//
// =========================================================

import {
    collection,
    onSnapshot,
    query,
    orderBy
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

import {
    db
} from "../admin/assets/js/firebase.js";


// =========================================================
// LOCAL APPLICATION DATA
// =========================================================
//
// IMPORTANT:
// These arrays remain the same objects for the lifetime of
// the application. Snapshot updates modify their contents
// instead of replacing the arrays.
//
// This makes imports much safer:
//
// import { allProducts } from "./client-data-store.js";
//
// allProducts always points to the current array.
// =========================================================

export const allProducts = [];

export const allCategories = [];

export const allAdvertisements = [];

export const allServices = [];

export const allTraining = [];

export const allProjects = [];

export const allBrands = [];

export const allTestimonials = [];


export const allLessons = [];
export const allCourses = [];
export const allSettings = [];


// =========================================================
// DATA STORE REGISTRY
// =========================================================

const listeners = [];

let started = false;

let startPromise = null;


// =========================================================
// COLLECTION CONFIGURATION
// =========================================================
//
// Keeping configuration in one place makes it easier to add
// another client collection later.
// =========================================================

const collections = {

    products: {
        target: allProducts,
        event: "productsUpdated",
        orderBy: "updatedAt",
        direction: "desc"
    },

    categories: {
        target: allCategories,
        event: "categoriesUpdated",
        orderBy: "updatedAt",
        direction: "desc"
    },

    advertisements: {
        target: allAdvertisements,
        event: "advertisementsUpdated",
        orderBy: "createdAt",
        direction: "desc"
    },

    services: {
        target: allServices,
        event: "servicesUpdated"
    },

    training: {
        target: allTraining,
        event: "trainingUpdated"
    },

    projects: {
        target: allProjects,
        event: "projectsUpdated"
    },

    brands: {
        target: allBrands,
        event: "brandsUpdated"
    },

    testimonials: {
        target: allTestimonials,
        event: "testimonialsUpdated"
    },
    
    
    lessons: {
        target: allLessons,
        event: "lessonsUpdated"
    },
    courses: {
        target: allCourses,
        event: "coursesUpdated"
    },
    settings: {
        target: allSettings,
        event: "settingsUpdated"
    }    
       
};


// =========================================================
// ARRAY UPDATE HELPER
// =========================================================
//
// We mutate the existing array rather than:
//
// target = newArray;
//
// This is important because other modules may have imported
// the array reference.
// =========================================================

function updateArray(
    target,
    data
) {

    target.splice(
        0,
        target.length,
        ...data
    );

}


// =========================================================
// DISPATCH UPDATE EVENT
// =========================================================

function dispatchUpdateEvent(
    eventName,
    data
) {

    try {

        window.dispatchEvent(
            new CustomEvent(
                eventName,
                {
                    detail: data
                }
            )
        );

    }
    catch (error) {

        console.warn(
            `Unable to dispatch ${eventName}:`,
            error
        );

    }

}


// =========================================================
// SNAPSHOT HELPER
// =========================================================

function createSnapshotListener(
    collectionName,
    config
) {

    try {

        const collectionRef =
            collection(
                db,
                collectionName
            );


        let firestoreQuery =
            collectionRef;


        // =================================================
        // ORDER BY
        // =================================================

        if (
            config.orderBy
        ) {

            firestoreQuery =
                query(
                    collectionRef,

                    orderBy(
                        config.orderBy,
                        config.direction || "desc"
                    )
                );

        }


        // =================================================
        // SNAPSHOT
        // =================================================

        const unsubscribe =
            onSnapshot(

                firestoreQuery,

                snapshot => {

                    const data =
                        snapshot.docs.map(
                            document => ({

                                id:
                                    document.id,

                                ...document.data()

                            })
                        );


                    // =====================================
                    // UPDATE LOCAL ARRAY
                    // =====================================

                    updateArray(
                        config.target,
                        data
                    );


                    // =====================================
                    // NOTIFY APPLICATION
                    // =====================================

                    dispatchUpdateEvent(
                        config.event,
                        config.target
                    );


                    // =====================================
                    // DEBUG
                    // =====================================

                    console.log(
                        `Client data updated: ${collectionName}`,
                        config.target.length
                    );

                },

                error => {

                    console.error(
                        `Firestore listener failed: ${collectionName}`,
                        error
                    );


                    dispatchUpdateEvent(
                        `${config.event}:error`,
                        error
                    );

                }

            );


        listeners.push(
            unsubscribe
        );


        return unsubscribe;

    }
    catch (error) {

        console.error(
            `Unable to create listener for ${collectionName}:`,
            error
        );


        return null;

    }

}


// =========================================================
// START DATA STORE
// =========================================================
//
// Starts all Firestore listeners.
//
// The function returns a Promise so app.js can:
//
// await startDataStore();
//
// before rendering the UI.
// =========================================================

export function startDataStore() {

    if (started) {

        return startPromise;

    }

    started = true;

    startPromise =
        new Promise(
            resolve => {

                let initialized =
                    0;
                const total =
                    Object.keys(
                        collections
                    ).length;


                Object.entries(
                    collections
                ).forEach(
                    ([collectionName, config]) => {

                        createSnapshotListener(
                            collectionName,
                            config
                        );

                    }
                );


                /*
                 * Firestore onSnapshot() does not provide one
                 * global "all collections loaded" callback.
                 *
                 * Therefore initialization is considered
                 * complete once every collection has received
                 * its first snapshot.
                 */

                const originalEvents = [];


                Object.values(
                    collections
                ).forEach(
                    config => {

                        const handler =
                            () => {

                                initialized++;


                                if (
                                    initialized >= total
                                ) {

    originalEvents.forEach(
        item => {
    window.removeEventListener(
                item.event,
                item.handler
                    );
 }
);

console.log(
     "Fgshusoft client data store ready." );
    resolve();
}
};
    originalEvents.push({
          event:
          config.event,
          handler
    });

    window.addEventListener(
                            config.event,
                            handler,
                            {
                                once: false
                            }
                        );

                    }
                );

            }
        );

    console.log(
        "Fgshusoft client data store started."
    );


    return startPromise;

}


// =========================================================
// STOP DATA STORE
// =========================================================

export function stopDataStore() {

    listeners.forEach(
        unsubscribe => {

            try {

                if (
                    typeof unsubscribe ===
                    "function"
                ) {

                    unsubscribe();

                }

            }
            catch (error) {

                console.warn(
                    "Failed to unsubscribe:",
                    error
                );

            }

        }
    );


    listeners.length = 0;


    // Clear local data

    updateArray(
        allProducts,
        []
    );

    updateArray(
        allCategories,
        []
    );

    updateArray(
        allAdvertisements,
        []
    );

    updateArray(
        allServices,
        []
    );

    updateArray(
        allTraining,
        []
    );

    updateArray(
        allProjects,
        []
    );

    updateArray(
        allBrands,
        []
    );

    updateArray(
        allTestimonials,
        []
    );

////////////////////
    updateArray(
        allSettings,
        []
    );

    updateArray(
        allCourses,
        []
    );
    
    updateArray(
        allLessons,
        []
    );    
////////////////////
    started = false;

    startPromise = null;


    console.log(
        "Fgshusoft client data store stopped."
    );

}


// =========================================================
// DATA STORE STATUS
// =========================================================

export function isDataStoreStarted() {

    return started;

}


// =========================================================
// DATA STORE READY
// =========================================================
//
// Useful when another module needs to wait for the initial
// Firestore snapshots.
// =========================================================

export function whenDataStoreReady() {

    if (!startPromise) {

        return Promise.resolve();

    }

    return startPromise;

}


// =========================================================
// COLLECTION ACCESS
// =========================================================
//
// These helpers provide a clean API for other modules.
// =========================================================

export function getProducts() {

    return allProducts;

}


export function getCategories() {

    return allCategories;

}


export function getAdvertisements() {

    return allAdvertisements;

}


export function getServices() {

    return allServices;

}


export function getTraining() {

    return allTraining;

}


export function getProjects() {

    return allProjects;

}


export function getBrands() {

    return allBrands;

}


export function getTestimonials() {

    return allTestimonials;

}

////////////////////////
export function getSettings() {
    return allSettings;
}

export function getLessons() {
    return allLessons;
}

export function getCourses() {
    return allCourses;
}

// =========================================================
// FIND HELPERS
// =========================================================

export function findProduct(
    productId
) {

    return allProducts.find(
        product =>
            String(product.id) ===
            String(productId)
    ) || null;

}


export function findCategory(
    categoryId
) {

    return allCategories.find(
        category =>
            String(category.id) ===
            String(categoryId)
    ) || null;

}


export function findAdvertisement(
    advertisementId
) {

    return allAdvertisements.find(
        advertisement =>
            String(advertisement.id) ===
            String(advertisementId)
    ) || null;

}


// =========================================================
// CATEGORY HELPERS
// =========================================================

export function getCategoryById(
    categoryId
) {

    if (!categoryId) {

        return null;

    }


    return findCategory(
        categoryId
    );

}


export function getCategoryName(
    categoryId
) {

    const category =
        getCategoryById(
            categoryId
        );


    return (
        category?.name ||
        category?.title ||
        "Electronics"
    );

}


export function getCategoryIcon(
    categoryId
) {

    const category =
        getCategoryById(
            categoryId
        );


    const icon =
        String(
            category?.icon || ""
        ).trim();


    if (!icon) {

        return "fa-solid fa-microchip";

    }


    if (
        icon.includes("fa-solid") ||
        icon.includes("fa-regular") ||
        icon.includes("fa-brands")
    ) {

        return icon;

    }


    return `fa-solid ${icon}`;

}


// =========================================================
// DATA STORE SUMMARY
// =========================================================

export function getDataStoreStats() {

    return {

        products:
            allProducts.length,

        categories:
            allCategories.length,

        advertisements:
            allAdvertisements.length,

        services:
            allServices.length,

        training:
            allTraining.length,

        projects:
            allProjects.length,

        brands:
            allBrands.length,

        courses:
            allCourses.length,
        lessons:
            allLessons.length,
            
        testimonials:
            allTestimonials.length

    };

}


// =========================================================
// DEBUG / GLOBAL ACCESS
// =========================================================
//
// This is intentionally read-only in practice. It is useful
// from the browser console when debugging the client.
// =========================================================

window.FgshusoftDataStore = {

    get products() {
        return allProducts;
    },

    get categories() {
        return allCategories;
    },

    get advertisements() {
        return allAdvertisements;
    },

    get services() {
        return allServices;
    },

    get training() {
        return allTraining;
    },

    get projects() {
        return allProjects;
    },

    get brands() {
        return allBrands;
    },

    get testimonials() {
        return allTestimonials;
    },
    
    get settings() {
        return allSettings;
    },
    get courses() {
        return allCourses;
    },
    get lessons() {
        return allLessons;
    },    

    stats:
        getDataStoreStats,

    isStarted:
        isDataStoreStarted

};


// =========================================================
// READY
// =========================================================

console.log(
    "Fgshusoft client-data-store.js loaded."
);

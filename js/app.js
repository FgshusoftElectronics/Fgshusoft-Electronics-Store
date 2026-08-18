// =========================================================
// FGSHUSOFT ELECTRONICS
// CLIENT APPLICATION
// main/js/app.js
// =========================================================


// =========================================================
// CLIENT DATA STORE
// =========================================================

import {
    startDataStore,

    allProducts,
    allCategories,

    allAdvertisements,
    allServices,
    allTraining,
    allProjects,
    allBrands,
    
    allSettings,
    allLessons,
    allCourses,
    
    allTestimonials

} from "./client-data-store.js";

import {
    getAuthenticatedClient
} from "./client-auth-ui.js";




import {
    db,
    doc,
    getDoc,
    collection,
    addDoc,
    serverTimestamp,
    query,
    where,
    orderBy,
    getDocs
} from "./firebase-client.js";

// =========================================================
// SERVICES
// =========================================================

import {
    showLoader,
    updateLoader,
    hideLoader
} from "./loader.js";


// =========================================================
// APPLICATION STATE
// =========================================================

let applicationStarted = false;

let cartItems = [];
const CART_STORAGE_KEY =
    "fgshusoft_electronics_cart";

let currency = "FCFA";
let companyName = "";
let companyEmail= "";

// =========================================================
// DOM HELPER
// =========================================================

function getElement(id) {

    return document.getElementById(id);

}

function getCurrency(){
if( allSettings.length>0) {
const data = allSettings[0];
/*
Swal.fire({
 icon:"success",
 title:"Settings Data",
 text: JSON.stringify(data)
    });
 */   
 currency = data.currency || "FCFA";

document.title = data.companyName;

getElement("whatsapp").href = data.whatsapp;

getElement("phone").innerHTML = data.phone;

//alert( document.title )
document.querySelectorAll(".company-name").forEach(element => {
element.textContent =
       data.companyName;
});
companyName = data.companyName;

document.querySelectorAll(".company-email").forEach(element => {
    element.textContent =
        data.email;
});

document.querySelectorAll(".company-address").forEach(element => {
    element.textContent =
        data.address;
});

}
}


// =========================================================
// HTML ESCAPE
// =========================================================

function escapeHTML(value) {

    return String(value ?? "")

        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


// =========================================================
// NORMALIZE TEXT
// =========================================================

function normalizeText(value) {

    return String(value ?? "")

        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

}


// =========================================================
// PRODUCT VISIBILITY
// =========================================================

function isProductVisible(product) {

    if (!product) {
        return false;
    }

    if (product.visible === false) {
        return false;
    }

    if (
        product.status &&
        normalizeText(product.status) !== "active"
    ) {
        return false;
    }

    return true;

}


// =========================================================
// CATEGORY VISIBILITY
// =========================================================

function isCategoryVisible(category) {

    if (!category) {
        return false;
    }

    if (category.visible === false) {
        return false;
    }

    if (
        category.status &&
        normalizeText(category.status) !== "active"
    ) {
        return false;
    }

    return true;

}


// =========================================================
// GET STOCK
// =========================================================

function getStock(product) {

    const stock =
        Number(
            product?.stock ?? 0
        );

    if (!Number.isFinite(stock)) {
        return 0;
    }

    return Math.max(
        0,
        stock
    );

}


// =========================================================
// FORMAT PRICE
// =========================================================

function formatPrice(value) {

    const price =
        Number(value ?? 0);

    if (!Number.isFinite(price)) {
        return "0";
    }

    return price.toLocaleString(
        "en-US"
    );

}


// =========================================================
// CATEGORY LOOKUP
// =========================================================

function getCategorySafe(categoryId) {

    if (!categoryId) {
        return null;
    }

    const key =
        String(categoryId);


    return (
        allCategories.find(
            category =>
                String(category.id) === key
        ) || null
    );

}


// =========================================================
// CATEGORY NAME
// =========================================================

function getCategoryName(categoryId) {

    const category =
        getCategorySafe(
            categoryId
        );


    return (

        category?.name ||

        category?.title ||

        "Electronics"

    );

}


// =========================================================
// CATEGORY ICON
// =========================================================

function getCategoryIcon(categoryId) {

    const category =
        getCategorySafe(
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
// LOADER HELPER
// =========================================================
/*
function setLoading(
    percent,
    title,
    body,
    footer = "Please wait..."
) {
   
    
    try {

updateLoader({
icon:"fa-shield-halved",  
title:title,  
body: body,  
progress: percent, 
footer: footer
});


    
}
catch (error) {
    alert( e.message );
    console.warn(
    "Loader update failed:",
    error
   );

}

}
*/

// ============================================================
// SET LOADING STAGE
// ============================================================

async function setLoading(
    percent,
    title,
    body,
    footer = "Please wait..."
) {

    try {

        updateLoader({
            icon:
                "fa-shield-halved",
            title:
                title,
            body:
                body,
            progress:
                percent,
            footer:
                footer
        });


        // ----------------------------------------------------
        // IMPORTANT
        // Give the browser time to repaint the loader
        // before the next stage is executed.
        // ----------------------------------------------------

        await new Promise(
            resolve =>
                requestAnimationFrame(
                    () => {

                        requestAnimationFrame(
                            resolve
                        );

                    }
                )
        );

    }

    catch (error) {

        console.warn(
            "Loader update failed:",
            error
        );

    }

}
// =========================================================
// RUN STAGE
// =========================================================

async function runStage(
    percent,
    title,
    body,
    callback
) {

    await setLoading(
        percent,
        title,
        body
    );

    try {
        return await callback();
    }
    catch (error) {
        console.error(
            `Application stage failed: ${title}`,
            error
        );

        throw error;

    }

}


// =========================================================
// WAIT FOR INITIAL DATA
// =========================================================

function waitForInitialData(
    timeout = 10000
) {

    return new Promise(
        resolve => {

            let productsReady = false;

            let categoriesReady = false;


            const cleanup = () => {

                window.removeEventListener(
                    "productsUpdated",
                    productsHandler
                );

                window.removeEventListener(
                    "categoriesUpdated",
                    categoriesHandler
                );

            };


            const checkReady = () => {

                if (
                    productsReady &&
                    categoriesReady
                ) {

                    cleanup();

                    resolve(true);

                }

            };


            const productsHandler = () => {

                productsReady = true;

                checkReady();

            };


            const categoriesHandler = () => {

                categoriesReady = true;

                checkReady();

            };


            window.addEventListener(
                "productsUpdated",
                productsHandler
            );


            window.addEventListener(
                "categoriesUpdated",
                categoriesHandler
            );


            /*
             * Safety timeout.
             *
             * The application should not remain
             * stuck on the loader forever.
             */

            setTimeout(
                () => {

                    cleanup();

                    resolve(false);

                },
                timeout
            );


            /*
             * In case the snapshots arrived
             * before this function was called.
             */

            if (allProducts.length >= 0) {

                /*
                 * We cannot distinguish an empty
                 * collection from "not loaded" using
                 * the arrays alone.
                 *
                 * The timeout/listener mechanism
                 * therefore remains authoritative.
                 */

            }

        }
    );

}


// =========================================================
// LOAD SLIDES / HERO CAROUSEL
// =========================================================

async function loadSlides() {

    const carousel =
        getElement(
            "heroCarousel"
        );


    if (!carousel) {
        return;
    }


    try {

        if (

            window.bootstrap &&

            window.bootstrap.Carousel

        ) {

            const existing =
                window.bootstrap.Carousel
                    .getInstance(
                        carousel
                    );


            if (!existing) {

                new window.bootstrap.Carousel(
                    carousel,
                    {

                        interval: 5000,

                        ride: "carousel",

                        pause: "hover",

                        touch: true

                    }
                );

            }

        }

    }
    catch (error) {

        console.warn(
            "Hero carousel initialization failed:",
            error
        );

    }

}


// =========================================================
// LINK QUICK ACTIONS
// =========================================================

function linkQuickActions() {

    const quickAccess =
        getElement(
            "quickAccess"
        );


    if (!quickAccess) {
        return;
    }


    if (
        quickAccess.dataset.actionsLinked ===
        "true"
    ) {

        return;

    }


    quickAccess.addEventListener(
        "click",
        event => {

            const link =
                event.target.closest(
                    "a[href^='#']"
                );


            if (!link) {
                return;
            }


            const target =
                link.getAttribute(
                    "href"
                );


            if (
                !target ||
                target === "#"
            ) {

                return;

            }


            const element =
                document.querySelector(
                    target
                );


            if (!element) {
                return;
            }


            event.preventDefault();


            element.scrollIntoView({

                behavior: "smooth",

                block: "start"

            });

        }
    );


    quickAccess.dataset.actionsLinked =
        "true";

}


// =========================================================
// UPDATE ANIMATIONS
// =========================================================

async function updateAnimations() {

    try {

        if (
            typeof window.initializeAnimations ===
            "function"
        ) {

            await window.initializeAnimations();

        }
        else if (
            typeof window.updateAnimations ===
            "function"
        ) {

            await window.updateAnimations();

        }

    }
    catch (error) {

        console.warn(
            "Animation initialization failed:",
            error
        );

    }

}


// =========================================================
// CATEGORY FILTER
// =========================================================

function renderCategoryFilter() {

    const select =
        getElement(
            "categoryFilter"
        );


    if (!select) {
        return;
    }


    const currentValue =
        select.value;


    select.innerHTML = "";


    const allOption =
        document.createElement(
            "option"
        );


    allOption.value =
        "all";


    allOption.textContent =
        "All Categories";


    select.appendChild(
        allOption
    );


    allCategories

        .filter(
            isCategoryVisible
        )

        .forEach(
            category => {

                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    category.id ??
                    category.name ??
                    category.title ??
                    "";


                option.textContent =
                    category.name ??
                    category.title ??
                    "Unnamed Category";


                select.appendChild(
                    option
                );

            }
        );


    if (
        [
            ...select.options
        ].some(
            option =>
                option.value ===
                currentValue
        )
    ) {

        select.value =
            currentValue;

    }

}


// =========================================================
// UPDATE PRODUCT COUNTER
// =========================================================

function updateProductCounters() {

    const productsCount =
        getElement(
            "productsCount"
        );


    const visibleProducts =
        allProducts.filter(
            isProductVisible
        );


    if (productsCount) {

        productsCount.textContent =
            visibleProducts.length;

        productsCount.dataset.target =
            visibleProducts.length;

    }
    
getCurrency();

}


// =========================================================
// UPDATE FEATURED COUNTER
// =========================================================

function updateFeaturedCounter(
    count
) {

    const element =
        getElement(
            "featuredProductsCount"
        );


    if (!element) {
        return;
    }


    element.dataset.target =
        count;

}


// =========================================================
// RENDER PRODUCTS
// =========================================================

function renderProducts(
    productList = allProducts
) {

    const productContainer =
        getElement(
            "products"
        );


    if (!productContainer) {
        return;
    }


    productContainer.innerHTML =
        "";

    const visibleProducts =
        productList.filter(
            isProductVisible
        );


    if (!visibleProducts.length) {

        productContainer.innerHTML = `

            <div class="col-12">

                <div class="
                    alert
                    alert-warning
                    text-center
                    shadow-sm
                    border-0
                    rounded-4
                    py-5
                ">

                    <i class="
                        fa-solid
                        fa-box-open
                        fa-3x
                        mb-3
                        text-warning
                    "></i>

                    <h4 class="fw-bold">
                        No Products Found
                    </h4>

                    <p class="text-muted mb-0">
                        Try another keyword or category.
                    </p>

                </div>

            </div>

        `;

        return;

    }

/////////////
getCurrency();
////////////

    let html = "";


    visibleProducts.forEach(
        product => {

            const stock =
                getStock(
                    product
                );


            const inStock =
                stock > 0;


            const price =
                formatPrice(
                    product.price
                );


            const thumbnail =
                product.thumbnail ||
                "";


            const productId =
                String(
                    product.id || ""
                );


            const categoryId =
                product.categoryId ??
                product.category ??
                "";

            const categoryName =
                getCategoryName(
                    categoryId
                );


            const categoryIcon =
                getCategoryIcon(
                    categoryId
                );


            const unit =
                product.unit ||
                "unit";
                
//alert( product.currency || "currency is not a field." )

            html += `
                <div
                    class="col product-item"
                    data-product-id="${escapeHTML(productId)}"
                >

                    <div class="
                        card
                        h-100
                        border-0
                        shadow-sm
                        rounded-4
                        overflow-hidden
                        product-card
                    ">

                        <div class="
                            position-relative
                            product-image-wrapper
                        ">

                            <img
                                src="${escapeHTML(thumbnail)}"
                                class="
                                    card-img-top
                                    product-image
                                "
                                alt="${escapeHTML(
                                    product.name ||
                                    "Product"
                                )}"
                                loading="lazy"
                                decoding="async"
                                style="
                                    height:200px;
                                    object-fit:cover;
                                "
                                onerror="
                                    this.onerror=null;
                                    this.style.display='none';
                                "
                            >


                            <span class="
                                badge
                                bg-primary
                                position-absolute
                                top-0
                                start-0
                                m-2
                                rounded-pill
                            ">

                                <i class="
                                    ${escapeHTML(
                                        categoryIcon
                                    )}
                                    me-1
                                "></i>

                                ${escapeHTML(
                                    categoryName
                                )}

                            </span>


                            <span class="
                                badge
                                ${
                                    inStock
                                        ? "bg-success"
                                        : "bg-secondary"
                                }
                                position-absolute
                                top-0
                                end-0
                                m-2
                                rounded-pill
                            ">

                                ${
                                    inStock
                                        ? `In Stock (${stock})`
                                        : "Out of Stock"
                                }

                            </span>

                        </div>


                        <div class="
                            card-body
                            d-flex
                            flex-column
                            p-4
                        ">

                            <h5 class="
                                fw-bold
                                mb-2
                            ">

                                ${escapeHTML(
                                    product.name ||
                                    "Unnamed Product"
                                )}

                            </h5>


                            <small class="
                                text-muted
                                mb-2
                            ">

                                <i class="
                                    fa-solid
                                    fa-barcode
                                    me-1
                                "></i>

                                SKU:

                                ${escapeHTML(
                                    product.sku ||
                                    "N/A"
                                )}

                            </small>


                            ${
                                product.model
                                    ? `

                                        <small class="
                                            text-muted
                                            mb-2
                                        ">

                                            <i class="
                                                fa-solid
                                                fa-tag
                                                me-1
                                            "></i>

                                            Model:

                                            ${escapeHTML(
                                                product.model
                                            )}

                                        </small>

                                    `
                                    : ""
                            }


                            <p class="
                                text-muted
                                small
                                flex-grow-1
                                mb-3
                            ">

                                ${escapeHTML(
                                    product.description ||
                                    "No description available."
                                )}

                            </p>


                            <div class="
                                mb-3
                                product-price
                            ">

                                <h3 class="
                                    text-success
                                    fw-bold
                                    mb-0
                                ">

                                    ${price}

                                    <small class="
                                        fs-6
                                        fw-semibold
                                    ">

                                        ${currency}

                                    </small>

                                </h3>


                                <small class="text-muted">

                                    per
                                    ${escapeHTML(unit)}

                                </small>

                            </div>


                            <div class="
                                d-grid
                                gap-2
                            ">

                                <button
                                    type="button"
                                    class="
                                        btn
                                        btn-primary
                                        rounded-3
                                        product-add-cart
                                    "
                                    data-product-id="${escapeHTML(
                                        productId
                                    )}"
                                    ${
                                        !inStock
                                            ? "disabled"
                                            : ""
                                    }
                                >

                                    <i class="
                                        fa-solid
                                        fa-cart-plus
                                        me-1
                                    "></i>

                                    ${
                                        inStock
                                            ? "Add to Cart"
                                            : "Out of Stock"
                                    }

                                </button>


                                <button
                                    type="button"
                                    class="
                                        btn
                                        btn-outline-success
                                        rounded-3
                                        product-quick-view
                                    "
                                    data-product-id="${escapeHTML(
                                        productId
                                    )}"
                                >

                                    <i class="
                                        fa-solid
                                        fa-eye
                                        me-1
                                    "></i>

                                    Quick View

                                </button>

                            </div>

                        </div>

                    </div>

                </div>

            `;

        }
    );


    productContainer.innerHTML =
        html;

}


// =========================================================
// RENDER FEATURED PRODUCTS
// =========================================================

function renderFeaturedProducts(
    productList = allProducts
) {

    const featuredContainer =
        getElement(
            "featuredProducts"
        );


    if (!featuredContainer) {
        return;
    }


    const featured =
        productList

            .filter(
                product =>
                    isProductVisible(product) &&
                    product.featured === true &&
                    getStock(product) > 0
            )

            .slice(0, 10);


    const productsToShow =
        featured.length
            ? featured
            : productList

                .filter(
                    product =>
                        isProductVisible(product) &&
                        getStock(product) > 0
                )

                .slice(0, 10);


    updateFeaturedCounter(
        productsToShow.length
    );


    if (!productsToShow.length) {

        featuredContainer.innerHTML = `

            <div class="
                text-center
                py-5
                my-4 bg-primary
            ">

                <div class="mb-4">

                    <i class="
                        fas
                        fa-box-open
                        fa-5x
                        text-muted
                    "></i>

                </div>


                <h4 class="
                    fw-bold
                    text-dark
                    mb-2
                ">

                    No Products Found

                </h4>


                <p class="
                    text-muted
                    mb-0
                ">

                    There are currently no
                    products available to display.

                </p>

            </div>

        `;

        return;

    }


    let html = "";


    productsToShow.forEach(
        product => {

            const price =
                formatPrice(
                    product.price
                );


            const thumbnail =
                product.thumbnail ||
                "";


            const productId =
                String(
                    product.id || ""
                );

/*
            html += `

                <div class="
                    col-md-6
                    col-lg-3
                ">

                    <div class="
                        card
                        featured-card
                        h-100
                        border-0
                        shadow-sm
                        rounded-4
                        overflow-hidden
                    ">

                        <div class="
                            position-relative
                        ">

                            <img
                                src="${escapeHTML(thumbnail)}"
                                class="card-img-top"
                                alt="${escapeHTML(
                                    product.name ||
                                    "Featured product"
                                )}"
                                loading="lazy"
                                decoding="async"
                                style="
                                    height:220px;
                                    object-fit:cover;
                                "
                                onerror="
                                    this.onerror=null;
                                    this.style.display='none';
                                "
                            >


                            <span class="
                                badge
                                bg-danger
                                position-absolute
                                top-0
                                start-0
                                m-2
                                rounded-pill
                            ">

                                <i class="
                                    fa-solid
                                    fa-fire
                                    me-1
                                "></i>

                                Featured

                            </span>

                        </div>


                        <div class="
                            card-body
                            d-flex
                            flex-column
                            p-4
                        ">

                            <h5 class="fw-bold">

                                ${escapeHTML(
                                    product.name ||
                                    "Product"
                                )}

                            </h5>


                            <p class="
                                text-muted
                                small
                                flex-grow-1
                            ">

                                ${escapeHTML(
                                    product.description ||
                                    "No description available."
                                )}

                            </p>


                            <h4 class="
                                text-success
                                fw-bold
                                mb-3
                            ">

                                ${price}

                                <small class="
                                    fs-6
                                    fw-semibold
                                ">

                                    ${currency}

                                </small>

                            </h4>


                            <button
                                type="button"
                                class="
                                    btn
                                    btn-primary
                                    w-100
                                    rounded-3
                                    featured-add-cart
                                "
                                data-product-id="${escapeHTML(
                                    productId
                                )}"
                            >

                                <i class="
                                    fa-solid
                                    fa-cart-plus
                                    me-1
                                "></i>

                                Add To Cart

                            </button>

                        </div>

                    </div>

                </div>

            `;
*/
html += `

    <div class="
        col-6
        col-md-4
        col-lg-3
    ">

        <div class="
            card
            featured-card
            h-100
            border-0
            shadow-sm
            rounded-4
            overflow-hidden
        ">

            <div class="position-relative">

                <img
                    src="${escapeHTML(thumbnail)}"
                    class="card-img-top"
                    alt="${escapeHTML(
                        product.name ||
                        "Featured product"
                    )}"
                    loading="lazy"
                    decoding="async"
                    style="
                        height:220px;
                        object-fit:cover;
                    "
                    onerror="
                        this.onerror=null;
                        this.style.display='none';
                    "
                >

                <span class="
                    badge
                    bg-danger
                    position-absolute
                    top-0
                    start-0
                    m-2
                    rounded-pill
                ">

                    <i class="
                        fa-solid
                        fa-fire
                        me-1
                    "></i>

                    Featured

                </span>

            </div>


            <div class="
                card-body
                d-flex
                flex-column
                p-4
            ">

                <h5 class="fw-bold">

                    ${escapeHTML(
                        product.name ||
                        "Product"
                    )}

                </h5>


                <p class="
                    text-muted
                    small
                    flex-grow-1
                ">

                    ${escapeHTML(
                        product.description ||
                        "No description available."
                    )}

                </p>


                <h4 class="
                    text-success
                    fw-bold
                    mb-3
                ">

                    ${price}

                    <small class="
                        fs-6
                        fw-semibold
                    ">

                        ${currency}

                    </small>

                </h4>


                <button
                    type="button"
                    class="
                        btn
                        btn-primary
                        w-100
                        rounded-3
                        featured-add-cart
                    "
                    data-product-id="${escapeHTML(
                        productId
                    )}"
                >

                    <i class="
                        fa-solid
                        fa-cart-plus
                        me-1
                    "></i>

                    Add To Cart

                </button>

            </div>

        </div>

    </div>

`;
        }
    );


    featuredContainer.innerHTML =
        html;

}


// =========================================================
// SEARCH / FILTER
// =========================================================

function filterProducts() {

    const searchInput =
        getElement(
            "searchBox"
        );


    const categorySelect =
        getElement(
            "categoryFilter"
        );


    const search =
        normalizeText(
            searchInput?.value || ""
        );


    const category =
        categorySelect?.value ||
        "all";


    const filtered =
        allProducts.filter(
            product => {

                if (
                    !isProductVisible(
                        product
                    )
                ) {

                    return false;

                }


                const name =
                    normalizeText(
                        product.name ||
                        product.title ||
                        ""
                    );


                const description =
                    normalizeText(
                        product.description ||
                        ""
                    );


                const sku =
                    normalizeText(
                        product.sku ||
                        ""
                    );


                const model =
                    normalizeText(
                        product.model ||
                        ""
                    );


                const productCategory =
                    String(
                        product.categoryId ??
                        product.category ??
                        ""
                    );


                const matchesSearch =

                    !search ||

                    name.includes(search) ||

                    description.includes(search) ||

                    sku.includes(search) ||

                    model.includes(search);


                const matchesCategory =

                    category === "all" ||

                    productCategory ===
                    String(category);


                return (
                    matchesSearch &&
                    matchesCategory
                );

            }
        );


    renderProducts(
        filtered
    );

}


// =========================================================
// PRODUCT EVENTS
// =========================================================

function initProductEvents() {

    const searchBox =
        getElement(
            "searchBox"
        );


    const categoryFilter =
        getElement(
            "categoryFilter"
        );


    if (
        searchBox &&
        searchBox.dataset.eventsLinked !==
        "true"
    ) {

        searchBox.addEventListener(
            "input",
            filterProducts
        );


        searchBox.dataset.eventsLinked =
            "true";

    }


    if (
        categoryFilter &&
        categoryFilter.dataset.eventsLinked !==
        "true"
    ) {

        categoryFilter.addEventListener(
            "change",
            filterProducts
        );


        categoryFilter.dataset.eventsLinked =
            "true";

    }


    const productsContainer =
        getElement(
            "products"
        );


    if (
        productsContainer &&
        productsContainer.dataset.eventsLinked !==
        "true"
    ) {

        productsContainer.addEventListener(
            "click",
            event => {

                const cartButton =
                    event.target.closest(
                        ".product-add-cart"
                    );


                const quickViewButton =
                    event.target.closest(
                        ".product-quick-view"
                    );


                if (cartButton) {

                    const productId =
                        cartButton.dataset.productId;


                    addToCartPro(
                        productId
                    , 1 );

                    return;

                }


                if (quickViewButton) {

                    const productId =
                        quickViewButton.dataset.productId;


                    viewProduct(
                        productId
                    );

                }

            }
        );


        productsContainer.dataset.eventsLinked =
            "true";

    }


    const featuredContainer =
        getElement(
            "featuredProducts"
        );


    if (
        featuredContainer &&
        featuredContainer.dataset.eventsLinked !==
        "true"
    ) {

        featuredContainer.addEventListener(
            "click",
            event => {

                const button =
                    event.target.closest(
                        ".featured-add-cart"
                    );


                if (!button) {
                    return;
                }


                const productId =
                    button.dataset.productId;


                addToCartPro(
                    productId
                , 1 );

            }
        );


        featuredContainer.dataset.eventsLinked =
            "true";

    }

}


// =========================================================
// GLOBAL SEARCH
// =========================================================

function initGlobalSearch() {

    const globalSearch =
        getElement(
            "globalSearch"
        );


    if (!globalSearch) {
        return;
    }


    if (
        globalSearch.dataset.eventsLinked ===
        "true"
    ) {

        return;

    }


    globalSearch.addEventListener(
        "input",
        () => {

            const value =
                normalizeText(
                    globalSearch.value
                );


            const searchBox =
                getElement(
                    "searchBox"
                );


            if (searchBox) {

                searchBox.value =
                    globalSearch.value;


                filterProducts();

            }


            if (value) {

                const shop =
                    getElement(
                        "shop"
                    );


                if (shop) {

                    shop.scrollIntoView({

                        behavior: "smooth",

                        block: "start"

                    });

                }

            }

        }
    );


    globalSearch.dataset.eventsLinked =
        "true";

}


// =========================================================
// DATA STORE UPDATE HANDLERS
// =========================================================

function handleProductsUpdated() {

    console.log(
        "Products snapshot updated:",
        allProducts.length
    );


    updateProductCounters();


    renderProducts();


    renderFeaturedProducts();

}


function handleCategoriesUpdated() {

    console.log(
        "Categories snapshot updated:",
        allCategories.length
    );


    renderCategoryFilter();


    /*
     * Category names/icons inside product
     * cards may have changed.
     */

    renderProducts();


    renderFeaturedProducts();

}


// =========================================================
// OTHER DATA UPDATES
// =========================================================

function handleAdvertisementsUpdated() {

    console.log(
        "Advertisements snapshot updated:",
        allAdvertisements.length
    );

}


function handleServicesUpdated() {

    console.log(
        "Services snapshot updated:",
        allServices.length
    );

}


function handleTrainingUpdated() {

    console.log(
        "Training snapshot updated:",
        allTraining.length
    );

}


function handleProjectsUpdated() {

    console.log(
        "Projects snapshot updated:",
        allProjects.length
    );

}


function handleBrandsUpdated() {

    console.log(
        "Brands snapshot updated:",
        allBrands.length
    );

}


function handleTestimonialsUpdated() {

    console.log(
        "Testimonials snapshot updated:",
        allTestimonials.length
    );

}


// =========================================================
// DATA STORE EVENTS
// =========================================================

function initDataStoreEvents() {

    window.addEventListener(
        "productsUpdated",
        handleProductsUpdated
    );


    window.addEventListener(
        "categoriesUpdated",
        handleCategoriesUpdated
    );


    window.addEventListener(
        "advertisementsUpdated",
        handleAdvertisementsUpdated
    );


    window.addEventListener(
        "servicesUpdated",
        handleServicesUpdated
    );


    window.addEventListener(
        "trainingUpdated",
        handleTrainingUpdated
    );


    window.addEventListener(
        "projectsUpdated",
        handleProjectsUpdated
    );


    window.addEventListener(
        "brandsUpdated",
        handleBrandsUpdated
    );


    window.addEventListener(
        "testimonialsUpdated",
        handleTestimonialsUpdated
    );

}


// =========================================================
// INITIALIZE UI
// =========================================================

async function initializeUI() {

    try {

        if (
            typeof window.initializeUI ===
            "function"
        ) {

            await window.initializeUI();

        }

    }
    catch (error) {

        console.warn(
            "UI initialization failed:",
            error
        );

    }

}


// =========================================================
// INITIALIZE AUTH UI
// =========================================================

async function initializeAuthUI() {

    try {

        if (
            typeof window.initializeClientAuthUI ===
            "function"
        ) {

            await window.initializeClientAuthUI();

        }

    }
    catch (error) {

        console.warn(
            "Authentication UI initialization failed:",
            error
        );

    }

}






// =========================================================
// CART HELPERS
// =========================================================

function getCartItem(productId) {

    const id =
        String(productId ?? "").trim();

    return (
        cartItems.find(
            item =>
                String(item.id) === id
        ) || null
    );

}


function getProductById(productId) {

    const id =
        String(productId ?? "").trim();

    return (
        allProducts.find(
            product =>
                String(product.id) === id
        ) || null
    );

}


// =========================================================
// LOAD CART
// =========================================================

function loadCart() {

    try {

        const saved =
            localStorage.getItem(
                CART_STORAGE_KEY
            );


        if (!saved) {

            cartItems = [];

            return;

        }


        const parsed =
            JSON.parse(saved);


        if (!Array.isArray(parsed)) {

            cartItems = [];

            return;

        }


        cartItems =
            parsed
                .filter(
                    item =>
                        item &&
                        item.id
                )
                .map(
                    item => ({

                        id:
                            String(
                                item.id
                            ),

                        quantity:
                            Math.max(
                                1,
                                Math.floor(
                                    Number(
                                        item.quantity
                                    ) || 1
                                )
                            )

                    })
                );


        /*
         * Remove products that no longer
         * exist in the live product store.
         */

        cartItems =
            cartItems.filter(
                item =>
                    getProductById(
                        item.id
                    )
            );


    }
    catch (error) {

        console.error(
            "Failed to load cart:",
            error
        );

        cartItems = [];

    }

}


// =========================================================
// SAVE CART
// =========================================================

function saveCart() {

    try {

        localStorage.setItem(

            CART_STORAGE_KEY,

            JSON.stringify(
                cartItems
            )

        );

    }
    catch (error) {

        console.error(
            "Failed to save cart:",
            error
        );

    }

}


// =========================================================
// GET CART
// =========================================================

function getCart() {

    return cartItems
        .map(
            item => {

                const product =
                    getProductById(
                        item.id
                    );

                if (!product) {
                    return null;
                }

                return {

                    ...product,

                    quantity:
                        item.quantity,

                    subtotal:
                        Number(
                            product.price || 0
                        ) *
                        item.quantity

                };

            }
        )
        .filter(Boolean);

}


// =========================================================
// CART COUNT
// =========================================================

function getCartCount() {

    return cartItems.reduce(

        (
            total,
            item
        ) =>
            total +
            Number(
                item.quantity || 0
            ),

        0

    );

}







// =========================================================
// PRODUCT QUICK VIEW
// =========================================================

window.viewProduct = function(productId) {

    // =====================================================
    // FIND PRODUCT FROM LOCAL DATA STORE
    // =====================================================

    const product =
        allProducts.find(
            item =>
                String(item.id) ===
                String(productId)
        );


    // =====================================================
    // PRODUCT NOT FOUND
    // =====================================================

    if (!product) {

        Swal.fire({

            icon: "error",

            title: "Product Not Found",

            text:
                "This product is no longer available.",

            confirmButtonText: "Close",

            confirmButtonColor: "#0d6efd"

        });

        return;

    }


    // =====================================================
    // PRODUCT DATA
    // =====================================================

    const name =
        product.name ||
        product.title ||
        "Unnamed Product";


    const description =
        product.description ||
        "No description available.";


    const thumbnail =
        product.thumbnail ||
        product.image ||
        "";


    const price =
        formatPrice(
            product.price
        );


    const stock =
        getStock(product);


    const inStock =
        stock > 0;


    const productIdSafe =
        String(
            product.id || ""
        );


    const sku =
        product.sku ||
        "N/A";


    const model =
        product.model ||
        "";


    const unit =
        product.unit ||
        "unit";


    const categoryId =
        product.categoryId ??
        product.category ??
        "";


    // =====================================================
    // CATEGORY FROM LOCAL CACHE
    // =====================================================

    const category =
        allCategories.find(
            item =>
                String(item.id) ===
                String(categoryId)
        );


    const categoryName =
        category?.name ||
        category?.title ||
        "Electronics";


    let categoryIcon =
        String(
            category?.icon || ""
        ).trim();


    if (!categoryIcon) {

        categoryIcon =
            "fa-solid fa-microchip";

    }
    else if (
        !categoryIcon.includes("fa-solid") &&
        !categoryIcon.includes("fa-regular") &&
        !categoryIcon.includes("fa-brands")
    ) {

        categoryIcon =
            `fa-solid ${categoryIcon}`;

    }


    // =====================================================
    // STOCK DISPLAY
    // =====================================================

    const stockHTML =
        inStock

            ? `

                <span class="
                    badge
                    bg-success
                    rounded-pill
                    px-3
                    py-2
                ">

                    <i class="
                        fa-solid
                        fa-circle-check
                        me-1
                    "></i>

                    In Stock

                    (${stock})

                </span>

            `

            : `

                <span class="
                    badge
                    bg-secondary
                    rounded-pill
                    px-3
                    py-2
                ">

                    <i class="
                        fa-solid
                        fa-circle-xmark
                        me-1
                    "></i>

                    Out of Stock

                </span>

            `;


    // =====================================================
    // PRODUCT IMAGE
    // =====================================================

    const imageHTML =
        thumbnail

            ? `

                <img
                    src="${escapeHTML(thumbnail)}"
                    alt="${escapeHTML(name)}"
                    class="
                        img-fluid
                        rounded-4
                        w-100
                    "
                    style="
                        height:320px;
                        object-fit:cover;
                    "
                    onerror="
                        this.onerror=null;
                        this.src='';
                        this.style.display='none';
                        this.nextElementSibling.classList.remove('d-none');
                    "
                >

                <div
                    class="
                        d-none
                        h-100
                        rounded-4
                        bg-light
                        d-flex
                        align-items-center
                        justify-content-center
                        text-muted
                    "
                    style="
                        min-height:320px;
                    "
                >

                    <div class="text-center">

                        <i class="
                            fa-solid
                            fa-image
                            fa-4x
                            mb-3
                        "></i>

                        <div>
                            Image unavailable
                        </div>

                    </div>

                </div>

            `

            : `

                <div
                    class="
                        rounded-4
                        bg-light
                        d-flex
                        align-items-center
                        justify-content-center
                        text-muted
                    "
                    style="
                        height:320px;
                    "
                >

                    <div class="text-center">

                        <i class="
                            fa-solid
                            fa-microchip
                            fa-4x
                            mb-3
                        "></i>

                        <div>
                            No image available
                        </div>

                    </div>

                </div>

            `;


    // =====================================================
    // ADD TO CART BUTTON
    // =====================================================

    const cartButton =
        inStock

            ? `

                <button
                    type="button"
                    class="
                        btn
                        btn-primary
                        btn-lg
                        rounded-3
                        w-100
                    "
                    id="quickViewAddToCart"
                    data-product-id="${escapeHTML(
                        productIdSafe
                    )}"
                >

                    <i class="
                        fa-solid
                        fa-cart-plus
                        me-2
                    "></i>

                    Add To Cart

                </button>

            `

            : `

                <button
                    type="button"
                    class="
                        btn
                        btn-secondary
                        btn-lg
                        rounded-3
                        w-100
                    "
                    disabled
                >

                    <i class="
                        fa-solid
                        fa-ban
                        me-2
                    "></i>

                    Out of Stock

                </button>

            `;


    // =====================================================
    // PRODUCT DETAILS
    // =====================================================

    const detailsHTML = `

        <div class="container-fluid px-0">

            <div class="row g-4 text-start">

                <!-- ===================================== -->
                <!-- IMAGE -->
                <!-- ===================================== -->

                <div class="
                    col-12
                    col-lg-5
                ">

                    <div class="
                        position-relative
                    ">

                        ${imageHTML}


                        <!-- CATEGORY -->

                        <span
                            class="
                                position-absolute
                                top-0
                                start-0
                                m-3
                                badge
                                bg-primary
                                rounded-pill
                                px-3
                                py-2
                            "
                        >

                            <i class="
                                ${escapeHTML(categoryIcon)}
                                me-1
                            "></i>

                            ${escapeHTML(
                                categoryName
                            )}

                        </span>


                        <!-- FEATURED -->

                        ${
                            product.featured === true

                                ? `

                                    <span
                                        class="
                                            position-absolute
                                            top-0
                                            end-0
                                            m-3
                                            badge
                                            bg-danger
                                            rounded-pill
                                            px-3
                                            py-2
                                        "
                                    >

                                        <i class="
                                            fa-solid
                                            fa-fire
                                            me-1
                                        "></i>

                                        Featured

                                    </span>

                                `

                                : ""
                        }

                    </div>

                </div>


                <!-- ===================================== -->
                <!-- DETAILS -->
                <!-- ===================================== -->

                <div class="
                    col-12
                    col-lg-7
                ">

                    <!-- NAME -->

                    <h3 class="
                        fw-bold
                        mb-2
                    ">

                        ${escapeHTML(name)}

                    </h3>


                    <!-- STOCK -->

                    <div class="mb-3">

                        ${stockHTML}

                    </div>


                    <!-- PRICE -->

                    <div class="
                        product-price
                        mb-3
                    ">

                        <span class="
                            fs-2
                            fw-bold
                            text-success
                        ">

                            ${escapeHTML(price)}

                            <small class="
                                fs-6
                                fw-semibold
                            ">

                                ${currency}

                            </small>

                        </span>

                        <div class="
                            small
                            text-muted
                        ">

                            Price per
                            ${escapeHTML(unit)}

                        </div>

                    </div>


                    <!-- DESCRIPTION -->

                    <div class="
                        border-top
                        pt-3
                        mb-3
                    ">

                        <h6 class="fw-bold">

                            <i class="
                                fa-solid
                                fa-align-left
                                me-2
                                text-primary
                            "></i>

                            Description

                        </h6>

                        <p class="
                            text-muted
                            mb-0
                            small
                        ">

                            ${escapeHTML(
                                description
                            )}

                        </p>

                    </div>


                    <!-- TECHNICAL DETAILS -->

                    <div class="
                        border-top
                        pt-3
                        mb-4
                    ">

                        <h6 class="fw-bold mb-3">

                            <i class="
                                fa-solid
                                fa-circle-info
                                me-2
                                text-primary
                            "></i>

                            Product Information

                        </h6>


                        <div class="
                            row
                            g-2
                            small
                        ">

                            <div class="col-6">

                                <div class="
                                    bg-light
                                    rounded-3
                                    p-2
                                ">

                                    <span class="
                                        text-muted
                                    ">
                                        SKU
                                    </span>

                                    <br>

                                    <strong>
                                        ${escapeHTML(sku)}
                                    </strong>

                                </div>

                            </div>


                            ${
                                model

                                    ? `

                                        <div class="col-6">

                                            <div class="
                                                bg-light
                                                rounded-3
                                                p-2
                                            ">

                                                <span class="
                                                    text-muted
                                                ">
                                                    Model
                                                </span>

                                                <br>

                                                <strong>
                                                    ${escapeHTML(model)}
                                                </strong>

                                            </div>

                                        </div>

                                    `

                                    : ""
                            }


                            <div class="col-6">

                                <div class="
                                    bg-light
                                    rounded-3
                                    p-2
                                ">

                                    <span class="
                                        text-muted
                                    ">
                                        Category
                                    </span>

                                    <br>

                                    <strong>
                                        ${escapeHTML(
                                            categoryName
                                        )}
                                    </strong>

                                </div>

                            </div>


                            <div class="col-6">

                                <div class="
                                    bg-light
                                    rounded-3
                                    p-2
                                ">

                                    <span class="
                                        text-muted
                                    ">
                                        Available
                                    </span>

                                    <br>

                                    <strong>

                                        ${
                                            inStock
                                                ? `${stock} ${escapeHTML(unit)}`
                                                : "Unavailable"
                                        }

                                    </strong>

                                </div>

                            </div>

                        </div>

                    </div>


                    <!-- QUANTITY -->

                    ${
                        inStock

                            ? `

                                <div class="
                                    mb-3
                                ">

                                    <label
                                        class="
                                            form-label
                                            fw-semibold
                                        "
                                    >

                                        Quantity

                                    </label>


                                    <div
                                        class="
                                            input-group
                                            input-group-lg
                                        "
                                    >

                                        <button
                                            type="button"
                                            class="
                                                btn
                                                btn-outline-secondary
                                            "
                                            id="quickViewMinus"
                                        >

                                            <i class="
                                                fa-solid
                                                fa-minus
                                            "></i>

                                        </button>


                                        <input
                                            type="number"
                                            id="quickViewQuantity"
                                            class="
                                                form-control
                                                text-center
                                                fw-bold
                                            "
                                            value="1"
                                            min="1"
                                            max="${stock}"
                                        >


                                        <button
                                            type="button"
                                            class="
                                                btn
                                                btn-outline-secondary
                                            "
                                            id="quickViewPlus"
                                        >

                                            <i class="
                                                fa-solid
                                                fa-plus
                                            "></i>

                                        </button>

                                    </div>

                                </div>

                            `

                            : ""
                    }


                    <!-- CART -->

                    ${cartButton}

                </div>

            </div>

        </div>

    `;


    // =====================================================
    // SHOW SWEETALERT
    // =====================================================

    Swal.fire({

        title:
            `<span class="fw-bold">${escapeHTML(name)}</span>`,

        html:
            detailsHTML,

        width:
            "950px",

        showConfirmButton:
            false,

        showCloseButton:
            true,

        customClass: {

            popup:
                "rounded-4 shadow-lg",

            htmlContainer:
                "text-start"

        },

        didOpen: () => {

            // =============================================
            // QUANTITY
            // =============================================

            const quantityInput =
                document.getElementById(
                    "quickViewQuantity"
                );


            const minusButton =
                document.getElementById(
                    "quickViewMinus"
                );


            const plusButton =
                document.getElementById(
                    "quickViewPlus"
                );


            const addButton =
                document.getElementById(
                    "quickViewAddToCart"
                );


            if (quantityInput) {

                quantityInput.addEventListener(
                    "input",
                    () => {

                        let quantity =
                            Number(
                                quantityInput.value
                            );


                        if (
                            !Number.isFinite(quantity) ||
                            quantity < 1
                        ) {

                            quantity = 1;

                        }


                        if (
                            quantity > stock
                        ) {

                            quantity = stock;

                        }


                        quantityInput.value =
                            quantity;

                    }
                );

            }


            if (minusButton) {

                minusButton.addEventListener(
                    "click",
                    () => {

                        let quantity =
                            Number(
                                quantityInput.value
                            );


                        quantity =
                            Math.max(
                                1,
                                quantity - 1
                            );


                        quantityInput.value =
                            quantity;

                    }
                );

            }


            if (plusButton) {

                plusButton.addEventListener(
                    "click",
                    () => {

                        let quantity =
                            Number(
                                quantityInput.value
                            );


                        quantity =
                            Math.min(
                                stock,
                                quantity + 1
                            );


                        quantityInput.value =
                            quantity;

                    }
                );

            }


            // =============================================
            // ADD TO CART
            // =============================================

            if (addButton) {

                addButton.addEventListener(
                    "click",
                    async () => {

                        const quantity =
                            Math.min(
                                stock,
                                Math.max(
                                    1,
                                    Number(
                                        quantityInput?.value ||
                                        1
                                    )
                                )
                            );


                        try {
                            await addToCart(
                                productIdSafe
                            , quantity );


                            Swal.close();


                            Swal.fire({

                                icon:
                                    "success",

                                title:
                                    "Added To Cart",

                                html: `

                                    <strong>
                                        ${escapeHTML(name)}
                                    </strong>

                                    <br>

                                    <span class="text-muted">

                                        Quantity:
                                        ${quantity}

                                    </span>

                                `,

                                timer:
                                    1200,

                                showConfirmButton:
                                    false

                            });

                        }
                        catch (error) {

                            console.error(
                                "Failed to add product to cart:",
                                error
                            );


                            Swal.fire({

                                icon:
                                    "error",

                                title:
                                    "Unable To Add",

                                text:
                                    "The product could not be added to your cart."

                            });

                        }

                    }
                );

            }

        }

    });

};


// =========================================================
// FIND PRODUCT
// =========================================================

function findProduct(productId) {

    return allProducts.find(
        product =>
            String(product.id) ===
            String(productId)
    ) || null;

}


// =========================================================
// GET PRODUCT STOCK
// =========================================================

function getProductStock(product) {

    const stock =
        Number(product?.stock ?? 0);

    if (!Number.isFinite(stock)) {
        return 0;
    }

    return Math.max(0, stock);

}


// =========================================================
// ADD TO CART
// =========================================================

function addToCart(
    productId,
    quantity = 1
) {

    const product =
        getProductById(
            productId
        );


    if (!product) {

        throw new Error(
            "Product not found."
        );

    }


    const stock =
        getProductStock(
            product
        );


    if (stock <= 0) {

        throw new Error(
            "This product is currently out of stock."
        );

    }


    quantity =
        Math.floor(
            Number(quantity)
        );


    if (
        !Number.isFinite(quantity) ||
        quantity <= 0
    ) {

        quantity = 1;

    }


    const existing =
        getCartItem(
            productId
        );


    if (existing) {

        const newQuantity =
            existing.quantity +
            quantity;


        if (
            newQuantity > stock
        ) {

            throw new Error(
                `Only ${stock} item${
                    stock === 1
                        ? ""
                        : "s"
                } available in stock.`
            );

        }


        existing.quantity =
            newQuantity;

    }

    else {

        if (
            quantity > stock
        ) {

            throw new Error(
                `Only ${stock} item${
                    stock === 1
                        ? ""
                        : "s"
                } available in stock.`
            );

        }


cartItems.push({

    id:
        String(
            product.id
        ),

    name:
        product.name ||
        "",

    price:
        Number(
            product.price
        ) || 0,

    image:
        product.image ||
        "",

    quantity:
        Number(
            quantity
        ) || 1

});

    }


    saveCart();

    updateCartUI();


    window.dispatchEvent(
        new CustomEvent(
            "cartUpdated",
            {
                detail:
                    getCart()
            }
        )
    );


    return getCartItem(
        productId
    );

}



// =========================================================
// ADD TO CART WITH USER FEEDBACK
// =========================================================

window.addToCartPro =
function (
    productId,
    quantity = 1
) {
    
    const product =
        getProductById(
            productId
        );


    if (!product) {

        Swal.fire({

            icon: "error",

            title: "Product Not Found",

            text:
                "The product could not be found."

        });

        return;

    }


    try {

        addToCart(
            productId,
            quantity
        );


        Swal.fire({

            icon: "success",

            title:
                `${product.name || "Product"} Added`,

            html:
                `
                    <div>

                        <i class="
                            fa-solid
                            fa-cart-plus
                            fa-2x
                            text-success
                            mb-2
                        "></i>

                        <div>
                            ${
                                quantity
                            }
                            ${
                                Number(quantity) === 1
                                    ? "item"
                                    : "items"
                            }
                            added to your cart.
                        </div>

                    </div>
                `,

            timer: 1500,

            showConfirmButton: false

        });

    }
    catch (error) {

        console.error(
            "Add to cart failed:",
            error
        );


        Swal.fire({

            icon: "warning",

            title: "Unable to Add",

            text:
                error.message ||
                "Unable to add this product to the cart.",

            timer: 2200,

            showConfirmButton: false

        });

    }

};



// =========================================================
// CART ACCESS
// =========================================================

function getCartItems() {

    return cartItems
        .map(item => {

            const product =
                getProductById(item.id);

            if (!product) {
                return null;
            }

            return {
                ...item,
                product
            };

        })
        .filter(Boolean);

}


// =========================================================
// CART ITEM COUNT
// =========================================================

function getCartItemCount() {

    return cartItems.reduce(
        (
            total,
            item
        ) =>
            total +
            Number(item.quantity || 0),

        0
    );

}



// =========================================================
// UPDATE CART QUANTITY
// =========================================================

function updateCartQuantity(
    productId,
    quantity
) {

    const item =
        cartItems.find(
            item =>
                String(item.id) ===
                String(productId)
        );

    if (!item) {
        return false;
    }


    const product =
        getProductById(productId);


    if (!product) {

        removeFromCart(productId);

        return false;

    }


    const stock =
        getProductStock(product);


    quantity =
        Number(quantity);


    if (!Number.isFinite(quantity)) {
        return false;
    }


    quantity =
        Math.floor(quantity);


    // -----------------------------------------------------
    // ZERO = REMOVE
    // -----------------------------------------------------

    if (quantity <= 0) {

        return removeFromCart(
            productId
        );

    }


    // -----------------------------------------------------
    // STOCK LIMIT
    // -----------------------------------------------------

    item.quantity =
        Math.min(
            quantity,
            stock
        );


    if (item.quantity <= 0) {

        removeFromCart(
            productId
        );

        return false;

    }


    saveCart();

    updateCartUI();


    window.dispatchEvent(
        new CustomEvent(
            "cartUpdated",
            {
                detail: getCart()
            }
        )
    );


    return true;

}



// =========================================================
// CART TOTAL
// =========================================================

function getCartTotal() {

    return cartItems.reduce(
        (
            total,
            item
        ) => {

            const product =
                getProductById(item.id);


            if (!product) {
                return total;
            }


            const price =
                Number(
                    product.price ?? 0
                );


            const quantity =
                Number(
                    item.quantity ?? 0
                );


            if (
                !Number.isFinite(price) ||
                !Number.isFinite(quantity)
            ) {

                return total;

            }


            return total +
                (price * quantity);

        },

        0
    );

}


// =========================================================
// UPDATE CART SUMMARY FAB
// =========================================================

function updateCartSummaryFab(
    animate = false
) {

    const fab =
        getElement("cartFab");


    const countBadge =
        getElement("cartFabCount");


    const totalBadge =
        getElement("cartTotalBadge");


    const totalElement =
        getElement("cartFabTotal");


    if (
        !fab ||
        !countBadge ||
        !totalBadge ||
        !totalElement
    ) {

        return;

    }


    const count =
        getCartCount();


    const total =
        getCartTotal();


    // -----------------------------------------------------
    // COUNT
    // -----------------------------------------------------

    countBadge.textContent =
        String(count);


    // -----------------------------------------------------
    // TOTAL
    // -----------------------------------------------------

    totalElement.textContent =
        `${formatPrice(total)} ${currency}`;


    // -----------------------------------------------------
    // EMPTY STATE
    // -----------------------------------------------------

    fab.classList.toggle(
        "cart-fab-empty",
        count === 0
    );


    // -----------------------------------------------------
    // ANIMATE
    // -----------------------------------------------------

    if (animate) {

        fab.classList.remove(
            "cart-fab-pop"
        );

        totalBadge.classList.remove(
            "cart-fab-total-pop"
        );


        /*
         * Force browser reflow so the
         * animation can restart even
         * when triggered repeatedly.
         */

        void fab.offsetWidth;
        void totalBadge.offsetWidth;


        fab.classList.add(
            "cart-fab-pop"
        );

        totalBadge.classList.add(
            "cart-fab-total-pop"
        );


        setTimeout(
            () => {

                fab.classList.remove(
                    "cart-fab-pop"
                );

                totalBadge.classList.remove(
                    "cart-fab-total-pop"
                );

            },
            500
        );

    }

}

// =========================================================
// INITIALIZE CART FAB
// =========================================================

function initCartFab() {

    const fab =
        getElement("cartFab");


    if (
        !fab ||
        fab.dataset.eventsLinked === "true"
    ) {

        return;

    }


    fab.addEventListener(
        "click",
        event => {

            event.preventDefault();

            openCart();

        }
    );


    fab.dataset.eventsLinked =
        "true";


    updateCartSummaryFab();

}




// =========================================================
// GLOBAL CART API
// =========================================================

window.FgshusoftCart = {

    getItems:
        getCartItems,

    getCount:
        getCartItemCount,

    getTotal:
        getCartTotal,

    add:
        addToCart,

    remove:
        removeFromCart,

    updateQuantity:
        updateCartQuantity,

    clear:
        clearCart

};



// =========================================================
// INCREASE QUANTITY
// =========================================================

function increaseQuantity(
    productId
) {

    const item =
        getCartItem(
            productId
        );


    if (!item) {
        return false;
    }


    const product =
        getProductById(
            productId
        );


    if (!product) {

        removeFromCart(
            productId
        );

        return false;

    }


    const stock =
        getProductStock(
            product
        );


    if (
        item.quantity >= stock
    ) {

        showCartWarning(

            "Maximum Stock Reached",

            `Only ${stock} item${
                stock === 1
                    ? ""
                    : "s"
            } available.`

        );

        return false;

    }


    item.quantity++;


    saveCart();

    updateCartUI();


    return true;

}


// =========================================================
// DECREASE QUANTITY
// =========================================================

function decreaseQuantity(
    productId
) {

    const item =
        getCartItem(
            productId
        );


    if (!item) {
        return false;
    }


    if (
        item.quantity <= 1
    ) {

        return false;

    }


    item.quantity--;


    saveCart();

    updateCartUI();


    return true;

}



// =========================================================
// REMOVE FROM CART
// =========================================================

function removeFromCart(
    productId
) {

    const id =
        String(
            productId ?? ""
        );


    const oldLength =
        cartItems.length;


    cartItems =
        cartItems.filter(
            item =>
                String(item.id) !== id
        );


    if (
        cartItems.length ===
        oldLength
    ) {

        return false;

    }


    saveCart();

    updateCartUI();


    return true;

}


// =========================================================
// CLEAR CART
// =========================================================

function clearCart() {

    cartItems = [];

    saveCart();

    updateCartUI();

}


// =========================================================
// CART WARNING
// =========================================================

function showCartWarning(
    title,
    text
) {

    if (
        typeof Swal ===
        "undefined"
    ) {

        return;

    }


    Swal.fire({

        icon: "warning",

        title,

        text,

        timer: 1800,

        showConfirmButton: false

    });

}



// =========================================================
// UPDATE CART UI
// =========================================================

function updateCartUI(
    animate = true
) {

updateCartSummaryFab(animate );
    
    const cartCount =
        getElement("cartCount");


    const cartItemsContainer =
        getElement("cartItems");


    const cartTotal =
        getElement("cartTotal");


    // -------------------------------------------------------
    // COUNTER
    // -------------------------------------------------------

    if (cartCount) {

        cartCount.textContent =
            String(
                getCartCount()
            );

    }


    if (!cartItemsContainer) {
        return;
    }


    // -------------------------------------------------------
    // EMPTY
    // -------------------------------------------------------

    if (!cartItems.length) {

        cartItemsContainer.innerHTML = `

            <div class="
                text-center
                py-5
            ">

                <i class="
                    fa-solid
                    fa-cart-shopping
                    fa-3x
                    text-muted
                    mb-3
                "></i>

                <h5 class="fw-bold">
                    Your cart is empty
                </h5>

                <p class="text-muted mb-0">
                    Add products to your cart
                    to see them here.
                </p>

            </div>

        `;


        if (cartTotal) {

            cartTotal.textContent =
                `0 ${currency}`;

        }


        return;

    }


    // -------------------------------------------------------
    // BUILD CART
    // -------------------------------------------------------

    const html =
        cartItems
            .map(
                item => {

                    const product =
                        getProductById(
                            item.id
                        );


                    if (!product) {
                        return "";
                    }


                    const price =
                        Number(
                            product.price || 0
                        );


                    const quantity =
                        item.quantity;


                    const subtotal =
                        price *
                        quantity;


                    const stock =
                        getProductStock(
                            product
                        );


                    const thumbnail =
                        product.thumbnail ||
                        "";


                    const name =
                        product.name ||
                        "Product";


                    const sku =
                        product.sku ||
                        "N/A";


                    const unit =
                        product.unit ||
                        "unit";


                    return `

                        <div
                            class="
                                cart-item
                                border
                                rounded-4
                                p-3
                                mb-3
                                shadow-sm
                            "
                            data-cart-id="${escapeHTML(
                                item.id
                            )}"
                        >

                            <div class="
                                d-flex
                                gap-3
                            ">

                                <!-- IMAGE -->

                                <div
                                    class="
                                        flex-shrink-0
                                    "
                                    style="
                                        width:80px;
                                        height:80px;
                                    "
                                >

                                    <img
                                        src="${escapeHTML(
                                            thumbnail
                                        )}"
                                        alt="${escapeHTML(
                                            name
                                        )}"
                                        class="
                                            rounded-3
                                            w-100
                                            h-100
                                        "
                                        style="
                                            object-fit:cover;
                                        "
                                        loading="lazy"
                                        onerror="
                                            this.onerror=null;
                                            this.style.display='none';
                                        "
                                    >

                                </div>


                                <!-- DETAILS -->

                                <div
                                    class="
                                        flex-grow-1
                                        min-width-0
                                    "
                                >

                                    <div class="
                                        d-flex
                                        justify-content-between
                                        gap-2
                                    ">

                                        <h6 class="
                                            fw-bold
                                            mb-1
                                        ">

                                            ${escapeHTML(
                                                name
                                            )}

                                        </h6>


                                        <button
                                            type="button"
                                            class="
                                                btn
                                                btn-sm
                                                btn-outline-danger
                                                rounded-circle
                                                cart-remove-btn
                                            "
                                            data-cart-action="remove"
                                            data-product-id="${escapeHTML(
                                                item.id
                                            )}"
                                            title="Remove"
                                        >

                                            <i class="
                                                fa-solid
                                                fa-trash
                                            "></i>

                                        </button>

                                    </div>


                                    <small class="
                                        text-muted
                                        d-block
                                    ">

                                        <i class="
                                            fa-solid
                                            fa-barcode
                                            me-1
                                        "></i>

                                        SKU:
                                        ${escapeHTML(
                                            sku
                                        )}

                                    </small>


                                    ${
                                        product.model
                                            ? `

                                                <small class="
                                                    text-muted
                                                    d-block
                                                ">

                                                    <i class="
                                                        fa-solid
                                                        fa-tag
                                                        me-1
                                                    "></i>

                                                    ${escapeHTML(
                                                        product.model
                                                    )}

                                                </small>

                                            `
                                            : ""
                                    }


                                    <div class="
                                        mt-2
                                    ">

                                        <strong
                                            class="
                                                text-success
                                            "
                                        >

                                            ${formatPrice(
                                                price
                                            )}

                                            <small>
                                                ${currency}
                                            </small>

                                        </strong>

                                        <small
                                            class="
                                                text-muted
                                            "
                                        >

                                            /
                                            ${escapeHTML(
                                                unit
                                            )}

                                        </small>

                                    </div>

                                </div>

                            </div>


                            <!-- CONTROLS -->

                            <div class="
                                d-flex
                                justify-content-between
                                align-items-center
                                mt-3
                                pt-3
                                border-top
                            ">

                                <div class="
                                    btn-group
                                ">

                                    <button
                                        type="button"
                                        class="
                                            btn
                                            btn-sm
                                            btn-outline-secondary
                                        "
                                        data-cart-action="decrease"
                                        data-product-id="${escapeHTML(
                                            item.id
                                        )}"
                                    >

                                        <i class="
                                            fa-solid
                                            fa-minus
                                        "></i>

                                    </button>


                                    <span class="
                                        btn
                                        btn-sm
                                        btn-light
                                        disabled
                                        px-3
                                        fw-bold
                                    ">

                                        ${quantity}

                                    </span>


                                    <button
                                        type="button"
                                        class="
                                            btn
                                            btn-sm
                                            btn-outline-primary
                                        "
                                        data-cart-action="increase"
                                        data-product-id="${escapeHTML(
                                            item.id
                                        )}"
                                        ${
                                            quantity >= stock
                                                ? "disabled"
                                                : ""
                                        }
                                    >

                                        <i class="
                                            fa-solid
                                            fa-plus
                                        "></i>

                                    </button>

                                </div>


                                <div
                                    class="
                                        text-end
                                    "
                                >

                                    <small
                                        class="
                                            text-muted
                                            d-block
                                        "
                                    >

                                        Subtotal

                                    </small>


                                    <strong
                                        class="
                                            text-success
                                        "
                                    >

                                        ${formatPrice(
                                            subtotal
                                        )}

                                        ${currency}

                                    </strong>

                                </div>

                            </div>

                        </div>

                    `;

                }
            )
            .join("");


    cartItemsContainer.innerHTML =
        html;


    // -------------------------------------------------------
    // TOTAL
    // -------------------------------------------------------

    if (cartTotal) {

        cartTotal.textContent =
            `${formatPrice(
                getCartTotal()
            )} ${currency}`;

    }
    

}



// =========================================================
// CART EVENTS
// =========================================================

function handleCartClick(
    event
) {

    const button =
        event.target.closest(
            "[data-cart-action]"
        );


    if (!button) {
        return;
    }


    event.preventDefault();


    const action =
        button.dataset.cartAction;


    const productId =
        button.dataset.productId;


    if (!productId) {
        return;
    }


    switch (action) {

        case "increase":

            increaseQuantity(
                productId
            );

            break;


        case "decrease":

            decreaseQuantity(
                productId
            );

            break;


        case "remove":

            removeFromCart(
                productId
            );

            break;

    }

}


// =========================================================
// INITIALIZE CART
// =========================================================

function initializeCart() {

    loadCart();


    const container =
        getElement("cartItems");


    if (
        container &&
        container.dataset.eventsLinked !==
        "true"
    ) {

        container.addEventListener(
            "click",
            handleCartClick
        );


        container.dataset.eventsLinked =
            "true";

    }

   // CART FAB & UI
    initCartFab();

    updateCartUI( false );


    console.log(
        "Fgshusoft cart initialized."
    );

}


// =========================================================
// OPEN CART
// =========================================================

function openCart() {

    updateCartUI();


    const modalElement =
        getElement("cartModal");


    if (!modalElement) {

        console.warn(
            "cartModal was not found."
        );

        return;

    }


    if (
        window.bootstrap &&
        window.bootstrap.Modal
    ) {

        const modal =
            window.bootstrap.Modal
                .getOrCreateInstance(
                    modalElement
                );


        modal.show();

    }

}


// =========================================================
// CLOSE CART
// =========================================================

function closeCart() {

    const modalElement =
        getElement("cartModal");


    if (!modalElement) {
        return;
    }


    if (
        window.bootstrap &&
        window.bootstrap.Modal
    ) {

        const modal =
            window.bootstrap.Modal
                .getInstance(
                    modalElement
                );


        if (modal) {
            modal.hide();
        }

    }

}


// ============================================================
// PLACE ORDER
// ============================================================

async function placeOrder() {

    // --------------------------------------------------------
    // CART VALIDATION
    // --------------------------------------------------------

if ( !cartItems.length) {

        await Swal.fire({

            icon: "info",

            title: "Your cart is empty",

            text:
                "Please add some products before placing your order.",

            confirmButtonText: "Continue"

        });

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

            icon: "error",

            title: "Unable to verify account",

            text:
                "We could not verify your client account. Please try again.",

            confirmButtonText: "OK"

        });

        return;

    }


    // --------------------------------------------------------
    // NOT AUTHENTICATED
    // --------------------------------------------------------

    if (!authResult.authenticated) {

        await Swal.fire({

            icon: "info",

            title: "Login required",

            html: `
                <p>
                    Please login or create a client account
                    before placing your order.
                </p>

                <i class="fa-solid fa-user-lock fa-3x text-primary mt-2"></i>
            `,

            confirmButtonText:
                "Login / Create Account",

            showCancelButton: true,

            cancelButtonText:
                "Cancel"

        }).then(result => {

            if (result.isConfirmed) {

                // Use your existing auth button/UI

    document.getElementById("authNavBtn")
                    ?.click();
            }
        });

        return;

    }


    // --------------------------------------------------------
    // AUTHENTICATED BUT FIRESTORE PROFILE DOES NOT EXIST
    // --------------------------------------------------------

    if (!authResult.exists) {

        await Swal.fire({

            icon: "warning",

            title: "Client profile not found",

            html: `
                <p>
                    Your account is authenticated, but your
                    client profile could not be found.
                </p>

                <p class="mb-0">
                    Please contact support before placing an order.
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
        "Verified client:",
        client
    );


    // --------------------------------------------------------
    // NOW WE CAN PLACE THE ORDER
    // --------------------------------------------------------

await saveOrderToFirestore(user, client );

}



// ============================================================
// SAVE ORDER TO FIRESTORE
// ============================================================


async function saveOrderToFirestore(
    user,
    client
) {

    try {

        // ----------------------------------------------------
        // VALIDATE CLIENT
        // ----------------------------------------------------

        if (!user?.uid) {

            throw new Error(
                "Authenticated client UID is missing."
            );

        }


        if (!client) {

            throw new Error(
                "Client profile is missing."
            );

        }


        // ----------------------------------------------------
        // BUILD ORDER ITEMS
        // ----------------------------------------------------

        const orderItems =
            cartItems.map(item => {

                const price =
                    Number(
                        item.price
                    );

                const quantity =
                    Number(
                        item.quantity
                    );


                if (
                    !Number.isFinite(price) ||
                    price < 0
                ) {

                    throw new Error(
                        `Invalid price for product: ${
                            item.name ||
                            item.id ||
                            "Unknown product"
                        }`
                    );

                }


                if (
                    !Number.isFinite(quantity) ||
                    quantity <= 0
                ) {

                    throw new Error(
                        `Invalid quantity for product: ${
                            item.name ||
                            item.id ||
                            "Unknown product"
                        }`
                    );

                }


                return {

                    productId:
                        String(
                            item.id
                        ),

                    name:
                        String(
                            item.name ||
                            "Unnamed Product"
                        ),

                    price:
                        price,

                    quantity:
                        quantity,

                    subtotal:
                        price *
                        quantity

                };

            });


        // ----------------------------------------------------
        // CALCULATE SUBTOTAL
        // ----------------------------------------------------

        const subtotal =
            orderItems.reduce(
                (
                    sum,
                    item
                ) =>
                    sum +
                    item.subtotal,
                0
            );


        // ----------------------------------------------------
        // DISCOUNT
        // ----------------------------------------------------

        const discount =
            0;


        // ----------------------------------------------------
        // TOTAL
        // ----------------------------------------------------

        const total =
            subtotal -
            discount;


        if (
            !Number.isFinite(total) ||
            total < 0
        ) {

            throw new Error(
                "Invalid order total."
            );

        }


        // ----------------------------------------------------
        // ORDER NUMBER
        // ----------------------------------------------------

        const orderNumber =
            `ORD-${Date.now()}`;


        // ----------------------------------------------------
        // CREATE ORDER
        // ----------------------------------------------------

        const orderRef =
            await addDoc(
                collection(
                    db,
                    "orders"
                ),
                {

                    // ========================================
                    // CUSTOMER
                    // ========================================

                    customerId:
                        user.uid,

                    customerName:
                        client.name ||
                        user.displayName ||
                        "Client",

                    customerPhone:
                        client.phone ||
                        "",


                    // ========================================
                    // ORDER
                    // ========================================

                    orderNumber:
                        orderNumber,

                    type:
                        "order",


                    // ========================================
                    // ITEMS
                    // ========================================

                    items:
                        orderItems,


                    // ========================================
                    // FINANCIAL
                    // ========================================

                    subtotal:
                        subtotal,

                    discount:
                        discount,

                    total:
                        total,


                    // ========================================
                    // NOTES
                    // ========================================

                    notes:
                        "",


                    // ========================================
                    // STATUS
                    // ========================================

                    orderStatus:
                        "pending",

                    paymentStatus:
                        "unpaid",

                    stockProcessed:
                        false,


                    // ========================================
                    // TIMESTAMPS
                    // ========================================

                    createdAt:
                        serverTimestamp(),

                    updatedAt:
                        serverTimestamp()

                }
            );


        // ----------------------------------------------------
        // FIRESTORE DOCUMENT ID
        // ----------------------------------------------------

        const orderID =
            orderRef.id;

// ============================================================
// TELEGRAM ORDER ALERT
// ============================================================

try {

    let msg =
        "*🛒 NEW ORDER RECEIVED*\n\n";


    // --------------------------------------------------------
    // ORDER INFORMATION
    // --------------------------------------------------------

    msg +=
        `*Order Number:* \`${orderNumber}\`\n`;

    msg +=
        `*Order ID:* \`${orderID}\`\n`;

    msg +=
        `*Client:* ${escapeTelegramMarkdown(
            client.name || "Unknown"
        )}\n`;

    msg +=
        `*Email:* ${escapeTelegramMarkdown(
            client.email || "Not provided"
        )}\n`;

    msg +=
        `*WhatsApp:* ${escapeTelegramMarkdown(
            client.phone || "Not provided"
        )}\n\n`;


    // --------------------------------------------------------
    // ITEMS
    // --------------------------------------------------------

    msg +=
        "```\n";

    msg +=
        "Item                 Qty   Price     Total\n";

    msg +=
        "--------------------------------------------\n";


    orderItems.forEach(item => {

        const name =
            String(
                item.name ||
                "Unknown"
            )
            .substring(
                0,
                18
            );


        const qty =
            Number(
                item.quantity
            );


        const price =
            Number(
                item.price
            );


        const itemTotal =
            Number(
                item.subtotal
            );


        msg +=
            `${name.padEnd(20)} ` +
            `${String(qty).padEnd(5)} ` +
            `${formatPrice(price).padEnd(9)} ` +
            `${formatPrice(itemTotal)}\n`;

    });


    msg +=
        "--------------------------------------------\n";


    msg +=
        `SUBTOTAL:                    ${formatPrice(
            subtotal
        )} ${currency}\n`;


    msg +=
        `DISCOUNT:                    ${formatPrice(
            discount
        )} ${currency}\n`;


    msg +=
        `TOTAL:                       ${formatPrice(
            total
        )} ${currency}\n`;


    msg +=
        "```\n";


    // --------------------------------------------------------
    // FOOTER
    // --------------------------------------------------------

    msg +=
        "\nFrom *Fgshusoft Electronics* ⚡";


    // --------------------------------------------------------
    // SEND
    // --------------------------------------------------------

    await sendTelegramAlert(
        msg
    );


    console.log(
        "Telegram order alert sent successfully."
    );

}

catch (telegramError) {

    // IMPORTANT:
    // Do NOT consider the order failed if Telegram fails.

    console.error(
        "Telegram notification failed:",
        telegramError
    );

}


        console.log(
            "========================================"
        );

        console.log(
            "ORDER CREATED SUCCESSFULLY"
        );

        console.log(
            "Order ID:",
            orderID
        );

        console.log(
            "Order Number:",
            orderNumber
        );

        console.log(
            "Customer:",
            client.name
        );

        console.log(
            "Subtotal:",
            subtotal
        );

        console.log(
            "Discount:",
            discount
        );

        console.log(
            "Total:",
            total
        );

        console.log(
            "========================================"
        );


        // ----------------------------------------------------
        // SUCCESS MESSAGE
        // ----------------------------------------------------

        await Swal.fire({

            icon:
                "success",

            title:
                "Order Placed Successfully! 🎉",

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

                        Thank you for choosing

                        <strong>
                            Fgshusoft Electronics
                        </strong>

                    </p>


                    <div
                        class="
                            bg-light
                            rounded-4
                            p-3
                            mb-3
                        ">

                        <small class="text-muted">
                            Order Number
                        </small>

                        <div
                            class="
                                fw-bold
                                fs-5
                                text-primary
                            ">

                            ${escapeHTML(
                                orderNumber
                            )}

                        </div>

                    </div>


                    <div
                        class="
                            d-flex
                            justify-content-between
                            align-items-center
                            border-top
                            pt-3
                        ">

                        <span>
                            Total
                        </span>

                        <strong
                            class="text-success fs-5">

                            ${formatPrice(
                                total
                            )}
                            ${currency}

                        </strong>

                    </div>

                </div>

            `,

            confirmButtonText:
                "Continue",

            confirmButtonColor:
                "#198754"

        });


        // ----------------------------------------------------
        // CLEAR CART
        // ----------------------------------------------------

        cartItems = [];


        clearCart();


        // ----------------------------------------------------
        // REFRESH CART UI
        // ----------------------------------------------------

        updateCartUI();


        if (
            typeof updateCartFAB ===
            "function"
        ) {

            updateCartFAB();

        }

    }

    catch (error) {

        console.error(
            "Failed to place order:",
            error
        );


        await Swal.fire({

            icon:
                "error",

            title:
                "Order Failed",

            html: `

                <p>
                    We could not place your order.
                </p>

                <small class="text-danger">

                    ${escapeHTML(
                        error.message ||
                        "Unknown error"
                    )}

                </small>

            `,

            confirmButtonText:
                "Try Again"

        });

    }

}


// ============================================================
// TELEGRAM MARKDOWN ESCAPE
// ============================================================

function escapeTelegramMarkdown(
    value
) {

    return String(
        value ?? ""
    )
        .replaceAll(
            "\\",
            "\\\\"
        )
        .replaceAll(
            "_",
            "\\_"
        )
        .replaceAll(
            "*",
            "\\*"
        )
        .replaceAll(
            "[",
            "\\["
        )
        .replaceAll(
            "`",
            "\\`"
        );

}


// ============================================================
// TELEGRAM ORDER ALERT
// ============================================================

async function sendTelegramAlert(message) {
    const botToken = "8548746480:AAHOsM4FtiutD8BTuhMEzgo7X1XIAlBva4w";
    const chatId = "8404185119";

    const url =
        `https://api.telegram.org/bot${botToken}/sendMessage`;

    const response =
        await fetch(url, {

            method: "POST",

            headers: {

                "Content-Type":
                    "application/json"

            },

            body:
                JSON.stringify({

                    chat_id:
                        chatId,

                    text:
                        message,

                    parse_mode:
                        "Markdown"

                })

        });


    if (!response.ok) {

        const errorText =
            await response.text();

        throw new Error(
            `Telegram error: ${errorText}`
        );

    }


    return response.json();

}




// ============================================================
// MY ORDERS
// ============================================================

let myOrdersModal = null;


// ============================================================
// OPEN MY ORDERS
// ============================================================

async function openMyOrders() {

    // --------------------------------------------------------
    // VERIFY AUTHENTICATION
    // --------------------------------------------------------

    let authResult;


    try {

        authResult =
            await getAuthenticatedClient();

    }

    catch (error) {

        console.error(
            "My Orders authentication error:",
            error
        );


        await Swal.fire({

            icon: "error",

            title: "Unable to verify account",

            text:
                "Please try again.",

            confirmButtonText:
                "OK"

        });

        return;

    }


    // --------------------------------------------------------
    // NOT LOGGED IN
    // --------------------------------------------------------

    if (
        !authResult.authenticated
    ) {

        await Swal.fire({

            icon: "info",

            title: "Login required",

            html: `

                <p>
                    Please login to view your orders.
                </p>

                <i
                    class="
                        fa-solid
                        fa-user-lock
                        fa-3x
                        text-primary
                    ">
                </i>

            `,

            confirmButtonText:
                "Login / Create Account",

            showCancelButton:
                true,

            cancelButtonText:
                "Cancel"

        }).then(result => {

            if (
                result.isConfirmed
            ) {

                document
                    .getElementById(
                        "authNavBtn"
                    )
                    ?.click();

            }

        });


        return;

    }


    // --------------------------------------------------------
    // OPEN MODAL
    // --------------------------------------------------------

    const modalElement =
        document.getElementById(
            "myOrdersModal"
        );


    if (!modalElement) {

        console.error(
            "myOrdersModal not found."
        );

        return;

    }


    myOrdersModal =
        bootstrap.Modal.getOrCreateInstance(
            modalElement
        );


    myOrdersModal.show();


    // --------------------------------------------------------
    // LOAD ORDERS
    // --------------------------------------------------------

    await loadMyOrders(
        authResult.user.uid
    );

}


// ============================================================
// LOAD MY ORDERS
// ============================================================

async function loadMyOrders(
    uid
) {

    const loading =
        document.getElementById(
            "myOrdersLoading"
        );

    const empty =
        document.getElementById(
            "myOrdersEmpty"
        );

    const errorBox =
        document.getElementById(
            "myOrdersError"
        );

    const errorText =
        document.getElementById(
            "myOrdersErrorText"
        );

    const container =
        document.getElementById(
            "myOrdersContainer"
        );


    // --------------------------------------------------------
    // RESET
    // --------------------------------------------------------

    loading?.classList.remove(
        "d-none"
    );

    empty?.classList.add(
        "d-none"
    );

    errorBox?.classList.add(
        "d-none"
    );

    container?.classList.add(
        "d-none"
    );


    if (container) {

        container.innerHTML = "";

    }


    try {

        // ----------------------------------------------------
        // FIRESTORE QUERY
        // ----------------------------------------------------

        const ordersQuery =
            query(

                collection(
                    db,
                    "orders"
                ),

                where(
                    "customerId",
                    "==",
                    uid
                ),

                orderBy(
                    "createdAt",
                    "desc"
                )

            );


        const snapshot =
            await getDocs(
                ordersQuery
            );


        const orders =
            snapshot.docs.map(
                document => ({

                    id:
                        document.id,

                    ...document.data()

                })
            );


        console.log(
            "My orders:",
            orders
        );


        loading?.classList.add(
            "d-none"
        );


        // ----------------------------------------------------
        // EMPTY
        // ----------------------------------------------------

        if (!orders.length) {

            empty?.classList.remove(
                "d-none"
            );

            return;

        }


        // ----------------------------------------------------
        // RENDER
        // ----------------------------------------------------

        renderMyOrders(
            orders
        );


        container?.classList.remove(
            "d-none"
        );

    }

    catch (err) {

        console.error(
            "Unable to load orders:",
            err
        );


        loading?.classList.add(
            "d-none"
        );


        errorBox?.classList.remove(
            "d-none"
        );


        if (errorText) {

            errorText.textContent =
                err.message ||
                "Unable to load your orders.";

        }

    }

}



// ============================================================
// RENDER MY ORDERS
// ============================================================

function renderMyOrders(
    orders
) {

    const container =
        document.getElementById(
            "myOrdersContainer"
        );


    if (!container) {
        return;
    }


    container.innerHTML =
        orders.map(
            order =>
                createOrderCard(
                    order
                )
        ).join("");

}


// ============================================================
// CREATE ORDER CARD
// ============================================================

function createOrderCard(
    order
) {

    const items =
        Array.isArray(
            order.items
        )
            ? order.items
            : [];


    const itemCount =
        items.reduce(
            (
                total,
                item
            ) =>
                total +
                Number(
                    item.quantity || 0
                ),
            0
        );


    const date =
        formatOrderDate(
            order.createdAt
        );


    const status =
        getOrderStatusBadge(
            order.orderStatus
        );


    const payment =
        getPaymentStatusBadge(
            order.paymentStatus
        );


    return `

        <div
            class="
                order-card
                bg-white
                rounded-4
                shadow-sm
                border
                mb-3
                overflow-hidden
            "
        >

            <!-- HEADER -->

            <div
                class="
                    p-3
                    p-md-4
                    border-bottom
                "
            >

                <div
                    class="
                        d-flex
                        flex-wrap
                        align-items-center
                        justify-content-between
                        gap-3
                    "
                >

                    <div>

                        <small
                            class="
                                text-muted
                                d-block
                                mb-1
                            "
                        >

                            Order Number

                        </small>


                        <div
                            class="
                                fw-bold
                                text-primary
                                fs-5
                            "
                        >

                            <i
                                class="
                                    fa-solid
                                    fa-hashtag
                                    me-1
                                "
                            ></i>

                            ${escapeHTML(
                                order.orderNumber ||
                                order.id
                            )}

                        </div>


                        <small
                            class="text-muted"
                        >

                            ${escapeHTML(
                                date
                            )}

                        </small>

                    </div>


                    <div
                        class="
                            d-flex
                            flex-wrap
                            gap-2
                        "
                    >

                        ${status}

                        ${payment}

                    </div>

                </div>

            </div>


            <!-- BODY -->

            <div
                class="
                    p-3
                    p-md-4
                "
            >

                <div
                    class="
                        d-flex
                        justify-content-between
                        align-items-center
                        mb-3
                    "
                >

                    <div>

                        <strong>

                            <i
                                class="
                                    fa-solid
                                    fa-bag-shopping
                                    text-primary
                                    me-2
                                "
                            ></i>

                            ${itemCount}

                            ${itemCount === 1
                                ? "item"
                                : "items"}

                        </strong>

                    </div>


                    <div
                        class="
                            fw-bold
                            text-success
                            fs-5
                        "
                    >

                        ${formatPrice(
                            Number(
                                order.total || 0
                            )
                        )}

                        ${currency}

                    </div>

                </div>


                <!-- ITEMS -->

                <div>

                    ${items
                        .map(
                            item => `

                                <div
                                    class="
                                        d-flex
                                        justify-content-between
                                        align-items-center
                                        gap-3
                                        py-2
                                        border-top
                                    "
                                >

                                    <div
                                        class="
                                            flex-grow-1
                                        "
                                    >

                                        <div
                                            class="fw-semibold"
                                        >

                                            ${escapeHTML(
                                                item.name ||
                                                "Product"
                                            )}

                                        </div>


                                        <small
                                            class="text-muted"
                                        >

                                            Qty:
                                            ${Number(
                                                item.quantity || 0
                                            )}

                                            ×

                                            ${formatPrice(
                                                Number(
                                                    item.price || 0
                                                )
                                            )}

                                            ${currency}

                                        </small>

                                    </div>


                                    <strong>

                                        ${formatPrice(
                                            Number(
                                                item.subtotal || 0
                                            )
                                        )}

                                        ${currency}

                                    </strong>

                                </div>

                            `
                        )
                        .join("")}

                </div>


                <!-- SUMMARY -->

                <div
                    class="
                        bg-light
                        rounded-3
                        p-3
                        mt-3
                    "
                >

                    <div
                        class="
                            d-flex
                            justify-content-between
                            text-muted
                            mb-1
                        "
                    >

                        <span>
                            Subtotal
                        </span>

                        <span>
                            ${formatPrice(
                                Number(
                                    order.subtotal || 0
                                )
                            )}
                            ${currency}
                        </span>

                    </div>


                    <div
                        class="
                            d-flex
                            justify-content-between
                            text-muted
                            mb-2
                        "
                    >

                        <span>
                            Discount
                        </span>

                        <span>
                            -
                            ${formatPrice(
                                Number(
                                    order.discount || 0
                                )
                            )}
                            ${currency}
                        </span>

                    </div>


                    <div
                        class="
                            d-flex
                            justify-content-between
                            fw-bold
                            border-top
                            pt-2
                        "
                    >

                        <span>
                            Total
                        </span>

                        <span
                            class="text-success"
                        >

                            ${formatPrice(
                                Number(
                                    order.total || 0
                                )
                            )}
                            ${currency}

                        </span>

                    </div>

                </div>

            </div>


            <!-- FOOTER -->

            <div
                class="
                    px-3
                    px-md-4
                    py-3
                    bg-light
                    border-top
                "
            >

                <div
                    class="
                        d-flex
                        justify-content-between
                        align-items-center
                        gap-2
                    "
                >

                    <small
                        class="text-muted"
                    >

                        <i
                            class="
                                fa-solid
                                fa-shield-halved
                                me-1
                            "
                        ></i>

                        Order securely stored

                    </small>


                    <button
                        type="button"
                        class="
                            btn
                            btn-outline-primary
                            btn-sm
                            rounded-pill
                        "
                        onclick="printOrderInvoice('${escapeHTML(
                            order.id
                        )}')"
                    >

                        <i
                            class="
                                fa-solid
                                fa-print
                                me-1
                            "
                        ></i>

                        Invoice

                    </button>

                </div>

            </div>

        </div>

    `;

}


// ============================================================
// ORDER STATUS BADGE
// ============================================================

function getOrderStatusBadge(
    status
) {

    const value =
        String(
            status ||
            "pending"
        ).toLowerCase();


    const config = {

        pending: [
            "warning",
            "fa-clock",
            "Pending"
        ],

        processing: [
            "info",
            "fa-spinner",
            "Processing"
        ],

        completed: [
            "success",
            "fa-circle-check",
            "Completed"
        ],

        delivered: [
            "success",
            "fa-truck",
            "Delivered"
        ],

        cancelled: [
            "danger",
            "fa-circle-xmark",
            "Cancelled"
        ]

    };


    const [
        color,
        icon,
        label
    ] =
        config[value] ||
        [
            "secondary",
            "fa-circle-info",
            value
        ];


    return `

        <span
            class="
                badge
                text-bg-${color}
                rounded-pill
                px-3
                py-2
            "
        >

            <i
                class="
                    fa-solid
                    ${icon}
                    me-1
                "
            ></i>

            ${escapeHTML(
                label
            )}

        </span>

    `;

}


// ============================================================
// PAYMENT STATUS BADGE
// ============================================================

function getPaymentStatusBadge(
    status
) {

    const value =
        String(
            status ||
            "unpaid"
        ).toLowerCase();


    const paid =
        [
            "paid",
            "completed",
            "success"
        ].includes(
            value
        );


    return `

        <span
            class="
                badge
                rounded-pill
                px-3
                py-2
                ${
                    paid
                        ? "text-bg-success"
                        : "text-bg-secondary"
                }
            "
        >

            <i
                class="
                    fa-solid
                    ${
                        paid
                            ? "fa-circle-check"
                            : "fa-credit-card"
                    }
                    me-1
                "
            ></i>

            ${paid
                ? "Paid"
                : "Unpaid"}

        </span>

    `;

}

// ============================================================
// ORDER DATE
// ============================================================

function formatOrderDate(
    value
) {

    if (!value) {
        return "Date unavailable";
    }


    try {

        if (
            typeof value.toDate ===
            "function"
        ) {

            return value
                .toDate()
                .toLocaleString();

        }


        if (
            value.seconds !==
            undefined
        ) {

            return new Date(
                Number(
                    value.seconds
                ) * 1000
            ).toLocaleString();

        }


        const date =
            new Date(
                value
            );


        if (
            !isNaN(
                date.getTime()
            )
        ) {

            return date.toLocaleString();

        }


        return String(
            value
        );

    }

    catch {

        return "Date unavailable";

    }

}

// ============================================================
// MY ORDERS EVENTS
// ============================================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        const myOrdersBtn =
            document.getElementById(
                "myOrdersBtn"
            );


        const refreshBtn =
            document.getElementById(
                "refreshMyOrdersBtn"
            );


        const retryBtn =
            document.getElementById(
                "retryMyOrdersBtn"
            );


        if (myOrdersBtn) {

            myOrdersBtn.addEventListener(
                "click",
                openMyOrders
            );

        }


        if (refreshBtn) {

            refreshBtn.addEventListener(
                "click",
                async () => {

                    const authResult =
                        await getAuthenticatedClient();


                    if (
                        authResult.authenticated
                    ) {

                        await loadMyOrders(
                            authResult.user.uid
                        );

                    }

                }
            );

        }


        if (retryBtn) {

            retryBtn.addEventListener(
                "click",
                openMyOrders
            );

        }

    }
);






// ============================================================
// PRINT ORDER INVOICE
// ============================================================

window.printOrderInvoice = async function (orderId) {

    if (!orderId) {
        return;
    }


    // --------------------------------------------------------
    // SHOW LOADING
    // --------------------------------------------------------

    Swal.fire({

        title: "Preparing invoice...",

        html: `
            <div class="py-3">

                <i
                    class="
                        fa-solid
                        fa-file-invoice
                        fa-3x
                        text-primary
                        mb-3
                    ">
                </i>

                <div>
                    Please wait...
                </div>

            </div>
        `,

        allowOutsideClick: false,

        showConfirmButton: false,

        didOpen: () => {

            Swal.showLoading();

        }

    });


    try {

        // ----------------------------------------------------
        // GET CURRENT USER
        // ----------------------------------------------------

        const authResult =
            await getAuthenticatedClient();


        if (
            !authResult.authenticated ||
            !authResult.user
        ) {

            Swal.close();

            await Swal.fire({

                icon: "warning",

                title: "Login required",

                text:
                    "Please login to print your invoice.",

                confirmButtonText: "Login"

            });

            return;

        }


        // ----------------------------------------------------
        // GET ORDER
        // ----------------------------------------------------

        const orderRef =
            doc(
                db,
                "orders",
                orderId
            );


        const snapshot =
            await getDoc(
                orderRef
            );


        if (!snapshot.exists()) {

            throw new Error(
                "Order could not be found."
            );

        }


        const order =
            {

                id:
                    snapshot.id,

                ...snapshot.data()

            };


        // ----------------------------------------------------
        // SECURITY CHECK
        // ----------------------------------------------------

        if (
            order.customerId !==
            authResult.user.uid
        ) {

            throw new Error(
                "You are not authorized to view this order."
            );

        }


        Swal.close();


        // ----------------------------------------------------
        // PRINT
        // ----------------------------------------------------

        generatePrintableInvoice(
            order
        );

    }

    catch (error) {

        console.error(
            "Invoice error:",
            error
        );


        Swal.close();


        await Swal.fire({

            icon: "error",

            title: "Invoice unavailable",

            text:
                error.message ||
                "Unable to prepare your invoice.",

            confirmButtonText: "OK"

        });

    }

}



// ============================================================
// GENERATE PRINTABLE INVOICE
// ============================================================

function generatePrintableInvoice(
    order
) {

    const items =
        Array.isArray(order.items)
            ? order.items
            : [];


    const invoiceWindow =
        window.open(
            "",
            "_blank",
            "width=1000,height=800"
        );


    if (!invoiceWindow) {

        Swal.fire({

            icon: "warning",

            title: "Popup blocked",

            text:
                "Please allow popups to print your invoice."

        });

        return;

    }


    const invoiceNumber =
        order.orderNumber ||
        order.id;


    const customerName =
        order.customerName ||
        "Client";


    const customerEmail =
        order.customerEmail ||
        "";


    const customerPhone =
        order.customerPhone ||
        "";


    const subtotal =
        Number(
            order.subtotal || 0
        );


    const discount =
        Number(
            order.discount || 0
        );


    const total =
        Number(
            order.total || 0
        );


    const createdAt =
        formatOrderDate(
            order.createdAt
        );


    const status =
        order.orderStatus ||
        "pending";


    const paymentStatus =
        order.paymentStatus ||
        "unpaid";


    // --------------------------------------------------------
    // INVOICE HTML
    // --------------------------------------------------------

    invoiceWindow.document.write(`

<!DOCTYPE html>

<html>

<head>

    <meta charset="UTF-8">

    <title>
        Invoice - ${escapeHTML(invoiceNumber)}
    </title>


    <style>

        * {
            box-sizing: border-box;
        }


        body {

            margin: 0;

            padding: 30px;

            background: #f1f5f9;

            color: #1e293b;

            font-family:
                Arial,
                Helvetica,
                sans-serif;

        }


        .invoice {

            width: 210mm;

            min-height: 297mm;

            margin: auto;

            background: #fff;

            padding: 18mm;

            box-shadow:
                0 10px 35px
                rgba(0,0,0,.12);

        }


        /* -------------------------------------------------
           HEADER
        ------------------------------------------------- */

        .header {

            display: flex;

            justify-content:
                space-between;

            align-items:
                flex-start;

            border-bottom:
                3px solid #0d6efd;

            padding-bottom: 20px;

        }


        .brand {

            display: flex;

            align-items:
                center;

            gap: 14px;

        }


        .logo {

            width: 58px;

            height: 58px;

            border-radius: 14px;

            display: flex;

            align-items:
                center;

            justify-content:
                center;

            background:
                linear-gradient(
                    135deg,
                    #0d6efd,
                    #084298
                );

            color: white;

            font-size: 25px;

            font-weight: bold;

        }


        .brand-name {

            font-size: 24px;

            font-weight: 800;

            color: #0d6efd;

        }


        .brand-subtitle {

            color: #64748b;

            font-size: 12px;

            margin-top: 3px;

        }


        .invoice-title {

            text-align: right;

        }


        .invoice-title h1 {

            margin: 0;

            font-size: 34px;

            letter-spacing: 2px;

            color: #0f172a;

        }


        .invoice-number {

            margin-top: 5px;

            color: #64748b;

            font-size: 13px;

        }


        /* -------------------------------------------------
           INFORMATION
        ------------------------------------------------- */

        .info {

            display: grid;

            grid-template-columns:
                1fr 1fr;

            gap: 30px;

            margin-top: 30px;

            margin-bottom: 30px;

        }


        .info-box {

            background: #f8fafc;

            border-radius: 12px;

            padding: 16px;

            border:
                1px solid #e2e8f0;

        }


        .info-title {

            font-size: 11px;

            text-transform:
                uppercase;

            letter-spacing:
                1px;

            font-weight: bold;

            color: #64748b;

            margin-bottom: 8px;

        }


        .customer-name {

            font-size: 17px;

            font-weight: bold;

            margin-bottom: 6px;

        }


        .info-line {

            font-size: 13px;

            color: #475569;

            margin: 3px 0;

        }


        /* -------------------------------------------------
           STATUS
        ------------------------------------------------- */

        .status-row {

            display: flex;

            gap: 8px;

            margin-top: 10px;

        }


        .badge {

            display: inline-block;

            padding: 6px 10px;

            border-radius: 20px;

            font-size: 11px;

            font-weight: bold;

        }


        .pending {

            background: #fef3c7;

            color: #92400e;

        }


        .paid {

            background: #dcfce7;

            color: #166534;

        }


        .unpaid {

            background: #e2e8f0;

            color: #475569;

        }


        /* -------------------------------------------------
           TABLE
        ------------------------------------------------- */

        table {

            width: 100%;

            border-collapse:
                collapse;

            margin-top: 20px;

        }


        thead {

            background:
                #0d6efd;

            color: white;

        }


        th {

            padding: 12px 10px;

            text-align: left;

            font-size: 12px;

        }


        td {

            padding: 12px 10px;

            border-bottom:
                1px solid #e2e8f0;

            font-size: 13px;

        }


        .text-right {

            text-align: right;

        }


        .text-center {

            text-align: center;

        }


        .item-name {

            font-weight: 600;

        }


        /* -------------------------------------------------
           TOTALS
        ------------------------------------------------- */

        .summary {

            width: 330px;

            margin-left: auto;

            margin-top: 25px;

        }


        .summary-row {

            display: flex;

            justify-content:
                space-between;

            padding: 7px 0;

            font-size: 13px;

            color: #475569;

        }


        .summary-total {

            display: flex;

            justify-content:
                space-between;

            border-top:
                2px solid #0f172a;

            margin-top: 8px;

            padding-top: 12px;

            font-size: 20px;

            font-weight: 800;

            color: #0d6efd;

        }


        /* -------------------------------------------------
           FOOTER
        ------------------------------------------------- */

        .footer {

            margin-top: 55px;

            padding-top: 20px;

            border-top:
                1px solid #e2e8f0;

            text-align: center;

            color: #64748b;

            font-size: 12px;

        }


        .thank-you {

            font-size: 15px;

            font-weight: bold;

            color: #0f172a;

            margin-bottom: 6px;

        }


        /* -------------------------------------------------
           PRINT
        ------------------------------------------------- */

        @media print {

            body {

                padding: 0;

                background: white;

            }


            .invoice {

                width: 100%;

                min-height: auto;

                padding: 0;

                box-shadow: none;

            }

        }


    </style>

</head>


<body>


<div class="invoice">


    <!-- ================================================
         HEADER
    ================================================= -->

    <div class="header">


        <div class="brand">

            <div class="logo">
                FE
            </div>


            <div>

                <div class="brand-name">

                    Fgshusoft Electronics

                </div>


                <div class="brand-subtitle">

                    Electronics • Components • Technology

                </div>

            </div>

        </div>


        <div class="invoice-title">

            <h1>
                INVOICE
            </h1>


            <div class="invoice-number">

                #${escapeHTML(
                    invoiceNumber
                )}

            </div>


            <div class="invoice-number">

                ${escapeHTML(
                    createdAt
                )}

            </div>

        </div>

    </div>



    <!-- ================================================
         CUSTOMER INFORMATION
    ================================================= -->

    <div class="info">


        <div class="info-box">

            <div class="info-title">

                Billed To

            </div>


            <div class="customer-name">

                ${escapeHTML(
                    customerName
                )}

            </div>


            <div class="info-line">

                ${escapeHTML(
                    customerEmail
                )}

            </div>


            <div class="info-line">

                ${escapeHTML(
                    customerPhone
                )}

            </div>


            ${
                order.customerAddress
                    ? `
                        <div class="info-line">

                            ${escapeHTML(
                                order.customerAddress
                            )}

                        </div>
                    `
                    : ""
            }

        </div>


        <div class="info-box">

            <div class="info-title">

                Order Information

            </div>


            <div class="info-line">

                <strong>
                    Order:
                </strong>

                ${escapeHTML(
                    invoiceNumber
                )}

            </div>


            <div class="info-line">

                <strong>
                    Date:
                </strong>

                ${escapeHTML(
                    createdAt
                )}

            </div>


            <div class="info-line">

                <strong>
                    Status:
                </strong>

                ${escapeHTML(
                    status
                )}

            </div>


            <div class="status-row">

                <span
                    class="
                        badge
                        pending
                    "
                >

                    ${escapeHTML(
                        status
                    )}

                </span>


                <span
                    class="
                        badge
                        ${
                            String(
                                paymentStatus
                            ).toLowerCase()
                            === "paid"
                                ? "paid"
                                : "unpaid"
                        }
                    "
                >

                    ${escapeHTML(
                        paymentStatus
                    )}

                </span>

            </div>

        </div>

    </div>



    <!-- ================================================
         ITEMS
    ================================================= -->

    <table>

        <thead>

            <tr>

                <th>
                    #
                </th>

                <th>
                    Item
                </th>

                <th class="text-center">
                    Qty
                </th>

                <th class="text-right">
                    Unit Price
                </th>

                <th class="text-right">
                    Total
                </th>

            </tr>

        </thead>


        <tbody>

            ${
                items
                    .map(
                        (item, index) => `

                            <tr>

                                <td>
                                    ${index + 1}
                                </td>

                                <td class="item-name">

                                    ${escapeHTML(
                                        item.name ||
                                        "Product"
                                    )}

                                </td>

                                <td class="text-center">

                                    ${Number(
                                        item.quantity ||
                                        0
                                    )}

                                </td>

                                <td class="text-right">

                                    ${formatPrice(
                                        Number(
                                            item.price ||
                                            0
                                        )
                                    )}

                                    ${currency}

                                </td>

                                <td class="text-right">

                                    ${formatPrice(
                                        Number(
                                            item.subtotal ||
                                            0
                                        )
                                    )}

                                    ${currency}

                                </td>

                            </tr>

                        `
                    )
                    .join("")
            }

        </tbody>

    </table>



    <!-- ================================================
         SUMMARY
    ================================================= -->

    <div class="summary">


        <div class="summary-row">

            <span>
                Subtotal
            </span>

            <strong>

                ${formatPrice(
                    subtotal
                )}

                ${currency}

            </strong>

        </div>


        <div class="summary-row">

            <span>
                Discount
            </span>

            <strong>

                ${formatPrice(
                    discount
                )}

                ${currency}

            </strong>

        </div>


        <div class="summary-total">

            <span>
                TOTAL
            </span>

            <span>

                ${formatPrice(
                    total
                )}

                ${currency}

            </span>

        </div>

    </div>



    <!-- ================================================
         FOOTER
    ================================================= -->

    <div class="footer">


        <div class="thank-you">

            Thank you for choosing
            Fgshusoft Electronics! 🙏

        </div>


        <div>

            We appreciate your business.

        </div>


        <div style="margin-top:8px;">

            This invoice was generated electronically.

        </div>

    </div>


</div>


<script>

    window.onload = function() {

        setTimeout(
            function() {

                window.print();

            },
            500
        );

    };

</script>


</body>

</html>

    `);


    invoiceWindow.document.close();

}
// =========================================================
// GLOBAL CART API
// =========================================================

window.FgshusoftCart = {

    get:
        getCart,

    getCount:
        getCartCount,

    getTotal:
        getCartTotal,

    add:
        addToCart,

    increase:
        increaseQuantity,

    decrease:
        decreaseQuantity,

    remove:
        removeFromCart,

    clear:
        clearCart,

    updateUI:
        updateCartUI

};


window.openCart =
    openCart;


window.closeCart =
    closeCart;


window.placeOrder =
    placeOrder;


window.increaseQuantity =
    increaseQuantity;


window.decreaseQuantity =
    decreaseQuantity;


window.removeFromCart =
    removeFromCart;


window.handleCartClick =
    handleCartClick;




// =========================================================
// CART ACTION BUTTONS
// =========================================================

function initCartActions() {

    // -----------------------------------------------------
    // VIEW CART
    // -----------------------------------------------------

    const viewCartButton =
        getElement("viewCart");

    if (
        viewCartButton &&
        viewCartButton.dataset.eventsLinked !== "true"
    ) {

        viewCartButton.addEventListener(
            "click",
            event => {

                event.preventDefault();

                openCart();

            }
        );

        viewCartButton.dataset.eventsLinked =
            "true";

    }


    // -----------------------------------------------------
    // PLACE ORDER
    // -----------------------------------------------------

    const placeOrderButton =
        getElement("placeOrder");

    if (
        placeOrderButton &&
        placeOrderButton.dataset.eventsLinked !== "true"
    ) {

        placeOrderButton.addEventListener(
            "click",
            event => {

                event.preventDefault();

                placeOrder();

            }
        );

        placeOrderButton.dataset.eventsLinked =
            "true";

    }

}


// =========================================================
// APPLICATION START
// =========================================================

async function startApplication() {

    if (applicationStarted) {
        return;
    }


    applicationStarted = true;


    try {

        // =================================================
        // STAGE 0
        // =================================================

        showLoader();


        setLoading(

            0,

            "FGSHUSOFT ELECTRONICS",

            "Initializing application..."

        );


        // =================================================
        // STAGE 1
        // DATA STORE
        // =================================================

        /*
         * Attach listeners BEFORE starting the
         * data store so we cannot miss the first
         * snapshots.
         */

        initDataStoreEvents();


        const initialDataReady =
            waitForInitialData();


        startDataStore();


        setLoading(

            15,

            "Client Data",

            "Synchronizing live application data..."

        );

// =========================================================
// INITIALIZE CART
// =========================================================

initializeCart();


        await initialDataReady;


        // =================================================
        // STAGE 2
        // HERO
        // =================================================

        await runStage(

            25,

            "Hero Section",

            "Preparing promotional slides...",

            loadSlides

        );


        // =================================================
        // STAGE 3
        // QUICK ACTIONS
        // =================================================

        await runStage(

            32,

            "Quick Access",

            "Linking quick actions...",

            linkQuickActions

        );


        // =================================================
        // STAGE 4
        // ANIMATIONS
        // =================================================

        await runStage(

            40,

            "User Interface",

            "Preparing interface animations...",

            updateAnimations

        );


        // =================================================
        // STAGE 5
        // CATEGORIES
        // =================================================

        await runStage(

            50,

            "Product Categories",

            "Preparing categories...",

            () => {

                renderCategoryFilter();

            }

        );


        // =================================================
        // STAGE 6
        // PRODUCTS
        // =================================================

        await runStage(

            62,

            "Electronic Shop",

            "Displaying products...",

            () => {

                updateProductCounters();

                renderProducts();

            }

        );


        // =================================================
        // STAGE 7
        // FEATURED
        // =================================================

        await runStage(

            72,

            "Featured Products",

            "Preparing featured products...",

            () => {

                renderFeaturedProducts();

            }

        );


        // =================================================
        // STAGE 8
        // PRODUCT EVENTS
        // =================================================

        await runStage(

            80,

            "Electronic Shop",

            "Connecting product controls...",

            initProductEvents

        );


        // =================================================
        // STAGE 9
        // GLOBAL SEARCH
        // =================================================

        await runStage(

            86,

            "Search",

            "Preparing global search...",

            initGlobalSearch

        );


        // =================================================
        // STAGE 10
        // UI
        // =================================================

        await runStage(

            92,

            "Interface",

            "Finalizing user interface...",

            initializeUI

        );

await runStage(
    94,
    "Shopping Cart",
    "Connecting cart controls...",
    initCartActions
);


        // =================================================
        // STAGE 11
        // AUTHENTICATION
        // =================================================

        await runStage(

            96,

            "Account",

            "Preparing account services...",

            initializeAuthUI

        );


        // =================================================
        // COMPLETE
        // =================================================

        setLoading(

            100,

            "FGSHUSOFT ELECTRONICS",

            "Application ready.",

            "Welcome to Fgshusoft Electronics"

        );


        await new Promise(
            resolve =>
                setTimeout(
                    resolve,
                    400
                )
        );


//alert( JSON.stringify(allSettings ))


        hideLoader();


        console.log(
            "FGSHUSOFT Electronics application initialized successfully."
        );


        console.log(
            "Live data:",
            {

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

                testimonials:
                    allTestimonials.length

            }
        );

    }
    catch (error) {

        console.error(
            "Client application initialization failed:",
            error
        );


        setLoading(

            100,

            "Initialization Error",

            "Some application components could not be loaded.",

            "Please refresh the page."

        );


        await new Promise(
            resolve =>
                setTimeout(
                    resolve,
                    1200
                )
        );


        hideLoader();

    }

}


// =========================================================
// DOM READY
// =========================================================

window.addEventListener(

    "DOMContentLoaded",

    startApplication,

    {
        once: true
    }

);


window.addEventListener(
    "productsUpdated",
    () => {

        /*
         * Product data may have changed:
         *
         * - price
         * - stock
         * - name
         * - image
         * - description
         * - visibility
         *
         * Re-render the cart using the
         * latest local product data.
         */

        updateCartUI();

    }
);



// =========================================================
// GLOBAL APPLICATION API
// =========================================================

window.FgshusoftApp = {

    // -----------------------------------------------------
    // LIVE DATA
    // -----------------------------------------------------

    getProducts: () =>
        [...allProducts],


    getCategories: () =>
        [...allCategories],


    getAdvertisements: () =>
        [...allAdvertisements],


    getServices: () =>
        [...allServices],


    getTraining: () =>
        [...allTraining],


    getProjects: () =>
        [...allProjects],


    getBrands: () =>
        [...allBrands],


    getTestimonials: () =>
        [...allTestimonials],


    // -----------------------------------------------------
    // PRODUCT OPERATIONS
    // -----------------------------------------------------

    filterProducts,

    renderProducts,

    renderFeaturedProducts,


    // -----------------------------------------------------
    // MANUAL REFRESH
    // -----------------------------------------------------

    refreshUI: () => {

        renderCategoryFilter();

        updateProductCounters();

        renderProducts();

        renderFeaturedProducts();

    },


    // -----------------------------------------------------
    // DATA STORE
    // -----------------------------------------------------

    startDataStore

};


console.log(
    "Fgshusoft client app module loaded."
);


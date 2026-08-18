
// ============================================================
// BRANDS MODULE
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


// ============================================================
// HELPERS
// ============================================================

function $(id) {
    return document.getElementById(id);
}


function escapeHTML(value) {

    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


// ============================================================
// LOAD BRANDS
// ============================================================

async function loadBrands() {

    const container =
        $("brandsContainer");

    const loading =
        $("brandsLoading");

    const empty =
        $("brandsEmpty");


    if (!container) {

        console.warn(
            "FGSHUSOFT BRANDS: brandsContainer not found."
        );

        return;

    }


    try {

        console.log(
            "FGSHUSOFT BRANDS: Loading brands..."
        );


        // ----------------------------------------------------
        // RESET UI
        // ----------------------------------------------------

        container.innerHTML = "";

        loading?.classList.remove(
            "d-none"
        );

        empty?.classList.add(
            "d-none"
        );


        // ----------------------------------------------------
        // FIRESTORE QUERY
        //
        // Brand documents do NOT have a "type" field.
        // Only filter by status.
        // ----------------------------------------------------

        const brandsQuery =
            query(

                collection(
                    db,
                    "brands"
                ),

                where(
                    "status",
                    "==",
                    "active"
                )

            );


        console.log(
            "FGSHUSOFT BRANDS: Executing Firestore query..."
        );


        const snapshot =
            await getDocs(
                brandsQuery
            );


        console.log(
            `FGSHUSOFT BRANDS: ${snapshot.size} brand(s) found.`
        );


        // ----------------------------------------------------
        // EMPTY STATE
        // ----------------------------------------------------

        if (
            snapshot.empty
        ) {

            empty?.classList.remove(
                "d-none"
            );

            console.log(
                "FGSHUSOFT BRANDS: No active brands found."
            );

            return;

        }


        // ----------------------------------------------------
        // RENDER BRANDS
        // ----------------------------------------------------

        snapshot.forEach(
            docSnapshot => {

                const brand =
                    docSnapshot.data();


                console.log(
                    "Rendering brand:",
                    docSnapshot.id,
                    brand
                );


                renderBrand(
                    brand,
                    docSnapshot.id
                );

            }
        );


    }

    catch (error) {

        console.error(
            "FGSHUSOFT BRANDS: Failed to load brands:",
            error
        );


        container.innerHTML = `

            <div class="col-12">

                <div
                    class="
                        alert
                        alert-danger
                        rounded-4
                        text-center
                        shadow-sm
                        p-4
                    "
                >

                    <div class="mb-3">

                        <i
                            class="
                                fa-solid
                                fa-triangle-exclamation
                                fa-3x
                            "
                        ></i>

                    </div>


                    <h5 class="fw-bold">

                        Unable to Load Brands

                    </h5>


                    <p class="mb-3">

                        We couldn't retrieve the brand
                        information right now.

                    </p>


                    <button
                        type="button"
                        class="btn btn-primary"
                        id="retryBrandsBtn"
                    >

                        <i
                            class="
                                fa-solid
                                fa-rotate-right
                                me-2
                            "
                        ></i>

                        Try Again

                    </button>

                </div>

            </div>

        `;


        // ----------------------------------------------------
        // RETRY BUTTON
        // ----------------------------------------------------

        document
            .getElementById("retryBrandsBtn")
            ?.addEventListener(
                "click",
                loadBrands
            );

    }

    finally {

        // ----------------------------------------------------
        // ALWAYS STOP LOADING
        // ----------------------------------------------------

        loading?.classList.add(
            "d-none"
        );

    }

}



// ============================================================
// RENDER BRAND
// ============================================================

function renderBrand(
    brand,
    brandId
) {

    const container =
        $("brandsContainer");


    if (!container) {
        return;
    }


    const name =
        brand.name ||
        "Unnamed Brand";


    const country =
        brand.country ||
        "";


    const description =
        brand.description ||
        "Trusted technology and electronics brand.";


    const logo =
        brand.logo ||
        "";


    const website =
        brand.website ||
        "";


    const status =
        brand.status ||
        "active";


    // --------------------------------------------------------
    // CREATE COLUMN
    // --------------------------------------------------------

    const col =
        document.createElement(
            "div"
        );


    col.className =
        "col-12 col-sm-6 col-lg-4 col-xl-3";


    // --------------------------------------------------------
    // ESCAPE VALUES
    // --------------------------------------------------------

    const safeName =
        escapeHTML(name);

    const safeCountry =
        escapeHTML(country);

    const safeDescription =
        escapeHTML(description);

    const safeLogo =
        escapeHTML(logo);

    const safeWebsite =
        escapeHTML(website);

    const safeStatus =
        escapeHTML(status);


    // --------------------------------------------------------
    // CARD
    // --------------------------------------------------------

    col.innerHTML = `

        <article
            class="brand-card"
            data-brand-id="${escapeHTML(brandId)}"
        >

            <!-- STATUS -->

            <span
                class="
                    brand-status
                    badge
                    rounded-pill
                    bg-success-subtle
                    text-success
                "
            >

                <i
                    class="
                        fa-solid
                        fa-circle
                        me-1
                    "
                    style="font-size:.45rem;"
                ></i>

                ${safeStatus}

            </span>


            <!-- LOGO -->

            <div
                class="brand-logo-wrapper"
            >

                ${
                    safeLogo

                    ?

                    `

                        <img
                            src="${safeLogo}"
                            alt="${safeName} logo"
                            class="brand-logo"
                            loading="lazy"
                            onerror="
                                this.style.display='none';
                                this.nextElementSibling
                                    .classList.remove('d-none');
                            "
                        >

                        <div
                            class="
                                brand-logo-fallback
                                d-none
                            "
                        >

                            <i
                                class="
                                    fa-solid
                                    fa-award
                                "
                            ></i>

                        </div>

                    `

                    :

                    `

                        <div
                            class="
                                brand-logo-fallback
                            "
                        >

                            <i
                                class="
                                    fa-solid
                                    fa-award
                                "
                            ></i>

                        </div>

                    `
                }

            </div>


            <!-- NAME -->

            <h3
                class="brand-name"
            >

                ${safeName}

            </h3>


            <!-- COUNTRY -->

            ${
                safeCountry

                ?

                `

                    <div
                        class="brand-country"
                    >

                        <i
                            class="
                                fa-solid
                                fa-location-dot
                                me-1
                            "
                        ></i>

                        ${safeCountry}

                    </div>

                `

                :

                ""
            }


            <!-- DESCRIPTION -->

            <p
                class="
                    brand-description
                    mb-0
                "
            >

                ${safeDescription}

            </p>


            <!-- WEBSITE -->

            ${
                safeWebsite

                ?

                `

                    <div
                        class="brand-website"
                    >

                        <a
                            href="${safeWebsite}"
                            target="_blank"
                            rel="noopener noreferrer"
                        >

                            <i
                                class="
                                    fa-solid
                                    fa-globe
                                "
                            ></i>

                            Visit Website

                            <i
                                class="
                                    fa-solid
                                    fa-arrow-up-right-from-square
                                    small
                                "
                            ></i>

                        </a>

                    </div>

                `

                :

                ""
            }

        </article>

    `;


    container.appendChild(
        col
    );

}

// ============================================================
// START BRANDS MODULE
// ============================================================

async function startBrands() {

    console.log(
        "FGSHUSOFT BRANDS: Initializing..."
    );

    await loadBrands();

    console.log(
        "FGSHUSOFT BRANDS: Ready."
    );

}


// ============================================================
// AUTO START
// ============================================================

if (
    document.readyState === "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        startBrands,
        {
            once: true
        }
    );

} else {

    startBrands();

}



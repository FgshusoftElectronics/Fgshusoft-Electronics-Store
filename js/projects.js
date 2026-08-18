// ============================================================
// FGSHUSOFT ELECTRONICS
// PROJECTS MODULE
// ============================================================

import {
    db,
    collection,
    getDocs,
    query,
    where
} from "./firebase-client.js";


// ============================================================
// DOM
// ============================================================

const trainingContainer =
    document.getElementById(
        "trainingContainer"
    );


// ============================================================
// HTML ESCAPE
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


// ============================================================
// FORMAT DATE
// ============================================================

function formatDate(value) {

    if (!value) {
        return "Not specified";
    }


    try {

        /*
         * Firestore Timestamp
         */

        if (
            typeof value.toDate ===
            "function"
        ) {

            return value
                .toDate()
                .toLocaleDateString();

        }


        const date =
            new Date(value);


        if (
            !Number.isNaN(
                date.getTime()
            )
        ) {

            return date.toLocaleDateString();

        }


        return String(value);

    }

    catch {

        return String(value);

    }

}


// ============================================================
// PROJECT ICON
// ============================================================

function getProjectIcon(
    category = "",
    name = ""
) {

    const value =
        `${category} ${name}`
            .toLowerCase();


    if (
        value.includes("arduino")
    ) {
        return "fa-microchip";
    }


    if (
        value.includes("esp32") ||
        value.includes("iot")
    ) {
        return "fa-wifi";
    }


    if (
        value.includes("robot")
    ) {
        return "fa-robot";
    }


    if (
        value.includes("web")
    ) {
        return "fa-globe";
    }


    if (
        value.includes("mobile")
    ) {
        return "fa-mobile-screen-button";
    }


    if (
        value.includes("solar") ||
        value.includes("energy")
    ) {
        return "fa-solar-panel";
    }


    if (
        value.includes("led") ||
        value.includes("display")
    ) {
        return "fa-lightbulb";
    }


    if (
        value.includes("electronics")
    ) {
        return "fa-microchip";
    }


    return "fa-graduation-cap";

}


// ============================================================
// STATUS
// ============================================================

function getStatusBadge(
    status = ""
) {

    const value =
        String(status)
            .toLowerCase();


    if (value === "completed") {

        return `

            <span
                class="badge
                       bg-success-subtle
                       text-success">

                <i
                    class="fa-solid
                           fa-circle-check
                           me-1">
                </i>

                Completed

            </span>

        `;

    }


    if (
        value === "active" ||
        value === "ongoing" ||
        value === "in-progress"
    ) {

        return `

            <span
                class="badge
                       bg-primary-subtle
                       text-primary">

                <i
                    class="fa-solid
                           fa-spinner
                           me-1">
                </i>

                In Progress

            </span>

        `;

    }


    if (
        value === "pending"
    ) {

        return `

            <span
                class="badge
                       bg-warning-subtle
                       text-warning-emphasis">

                <i
                    class="fa-solid
                           fa-clock
                           me-1">
                </i>

                Pending

            </span>

        `;

    }


    return `

        <span
            class="badge
                   bg-secondary-subtle
                   text-secondary">

            ${escapeHTML(
                status || "Unknown"
            )}

        </span>

    `;

}


// ============================================================
// RENDER CARD
// ============================================================

function renderTrainingCard(
    project
) {

    const name =
        project.name ||
        "Technology Training";


    const description =
        project.description ||
        "Practical technology training and project development.";


    const category =
        project.category ||
        "Technology";


    const image =
        project.image ||
        "";


    const progress =
        Math.max(
            0,
            Math.min(
                100,
                Number(
                    project.progress || 0
                )
            )
        );


    const icon =
        getProjectIcon(
            category,
            name
        );


    return `

        <div
            class="col-12 col-md-6 col-xl-4">

            <article
                class="training-card h-100">

                <!-- IMAGE -->

                <div
                    class="training-image-wrapper">

                    ${
                        image
                            ? `

                                <img
                                    src="${escapeHTML(image)}"
                                    alt="${escapeHTML(name)}"
                                    class="training-image"
                                    loading="lazy">

                              `
                            : `

                                <div
                                    class="training-image-placeholder">

                                    <i
                                        class="fa-solid
                                               ${icon}">
                                    </i>

                                </div>

                              `
                    }


                    <!-- STATUS -->

                    <div
                        class="training-status">

                        ${getStatusBadge(
                            project.status
                        )}

                    </div>

                </div>


                <!-- CONTENT -->

                <div
                    class="training-content">

                    <!-- CATEGORY -->

                    <div
                        class="small
                               text-primary
                               fw-semibold
                               mb-2">

                        <i
                            class="fa-solid
                                   ${icon}
                                   me-1">
                        </i>

                        ${escapeHTML(category)}

                    </div>


                    <!-- NAME -->

                    <h3
                        class="training-title">

                        ${escapeHTML(name)}

                    </h3>


                    <!-- DESCRIPTION -->

                    <p
                        class="training-description">

                        ${escapeHTML(
                            description
                        )}

                    </p>


                    <!-- META -->

                    <div
                        class="training-meta">

                        ${
                            project.startDate
                                ? `

                                    <span>

                                        <i
                                            class="fa-regular
                                                   fa-calendar
                                                   text-primary
                                                   me-1">
                                        </i>

                                        ${escapeHTML(
                                            formatDate(
                                                project.startDate
                                            )
                                        )}

                                    </span>

                                  `
                                : ""
                        }


                        ${
                            project.client
                                ? `

                                    <span>

                                        <i
                                            class="fa-solid
                                                   fa-user
                                                   text-primary
                                                   me-1">
                                        </i>

                                        ${escapeHTML(
                                            project.client
                                        )}

                                    </span>

                                  `
                                : ""
                        }

                    </div>


                    <!-- PROGRESS -->

                    <div class="mt-3">

                        <div
                            class="d-flex
                                   justify-content-between
                                   align-items-center
                                   mb-1">

                            <small
                                class="text-muted">

                                Progress

                            </small>


                            <small
                                class="fw-bold">

                                ${progress}%

                            </small>

                        </div>


                        <div
                            class="progress training-progress">

                            <div
                                class="progress-bar"
                                role="progressbar"
                                style="width:${progress}%"
                                aria-valuenow="${progress}"
                                aria-valuemin="0"
                                aria-valuemax="100">

                            </div>

                        </div>

                    </div>


                    <!-- FOOTER -->

                    <div
                        class="training-footer">

                        <div>

                            <small
                                class="text-muted d-block">

                                Training Budget

                            </small>


                            <strong
                                class="training-price">

                                ${formatPrice(
                                    project.budget
                                )}

                                <small>
                                    FCFA
                                </small>

                            </strong>

                        </div>


                        <button
                            type="button"
                            class="btn btn-primary
                                   training-btn
                                   view-training-btn"
                            data-project-id="${escapeHTML(
                                project.id
                            )}">

                            <i
                                class="fa-solid
                                       fa-eye
                                       me-1">
                            </i>

                            View

                        </button>

                    </div>

                </div>

            </article>

        </div>

    `;

}


// ============================================================
// EMPTY STATE
// ============================================================

function renderEmptyTraining() {

    trainingContainer.innerHTML = `

        <div class="col-12">

            <div
                class="training-empty
                       text-center">

                <div
                    class="training-empty-icon">

                    <i
                        class="fa-solid
                               fa-graduation-cap">
                    </i>

                </div>


                <h4 class="fw-bold">

                    Training Programs Coming Soon

                </h4>


                <p class="text-muted mb-0">

                    Our practical training programs
                    will be available here shortly.

                </p>

            </div>

        </div>

    `;

}


// ============================================================
// ERROR
// ============================================================

function renderTrainingError() {

    trainingContainer.innerHTML = `

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

                    Unable to load training

                </h5>


                <p class="mb-0">

                    Please try again later.

                </p>

            </div>

        </div>

    `;

}


// ============================================================
// VIEW TRAINING / PROJECT
// ============================================================

async function viewTraining(
    project
) {

    if (
        typeof Swal ===
        "undefined"
    ) {
        return;
    }


    const links = [];


    if (project.githubUrl) {

        links.push(`

            <a
                href="${escapeHTML(project.githubUrl)}"
                target="_blank"
                rel="noopener noreferrer"
                class="btn btn-dark">

                <i
                    class="fa-brands
                           fa-github
                           me-1">
                </i>

                GitHub

            </a>

        `);

    }


    if (project.projectUrl) {

        links.push(`

            <a
                href="${escapeHTML(project.projectUrl)}"
                target="_blank"
                rel="noopener noreferrer"
                class="btn btn-primary">

                <i
                    class="fa-solid
                           fa-arrow-up-right-from-square
                           me-1">
                </i>

                Project

            </a>

        `);

    }


    if (project.videoUrl) {

        links.push(`

            <a
                href="${escapeHTML(project.videoUrl)}"
                target="_blank"
                rel="noopener noreferrer"
                class="btn btn-danger">

                <i
                    class="fa-solid
                           fa-play
                           me-1">
                </i>

                Video

            </a>

        `);

    }


    await Swal.fire({

        title:
            escapeHTML(
                project.name ||
                "Training Project"
            ),

        html: `

            <div class="text-start">

                <p class="text-muted">

                    ${escapeHTML(
                        project.description ||
                        "No description available."
                    )}

                </p>


                <hr>


                <div class="row g-3">

                    <div class="col-6">

                        <small class="text-muted">
                            Category
                        </small>

                        <div class="fw-semibold">
                            ${escapeHTML(
                                project.category ||
                                "Technology"
                            )}
                        </div>

                    </div>


                    <div class="col-6">

                        <small class="text-muted">
                            Status
                        </small>

                        <div>
                            ${getStatusBadge(
                                project.status
                            )}
                        </div>

                    </div>


                    <div class="col-6">

                        <small class="text-muted">
                            Client
                        </small>

                        <div class="fw-semibold">

                            ${escapeHTML(
                                project.client ||
                                "Internal"
                            )}

                        </div>

                    </div>


                    <div class="col-6">

                        <small class="text-muted">
                            Lead
                        </small>

                        <div class="fw-semibold">

                            ${escapeHTML(
                                project.lead ||
                                "Fgshusoft Electronics"
                            )}

                        </div>

                    </div>


                    <div class="col-6">

                        <small class="text-muted">
                            Start Date
                        </small>

                        <div>

                            ${escapeHTML(
                                formatDate(
                                    project.startDate
                                )
                            )}

                        </div>

                    </div>


                    <div class="col-6">

                        <small class="text-muted">
                            End Date
                        </small>

                        <div>

                            ${escapeHTML(
                                formatDate(
                                    project.endDate
                                )
                            )}

                        </div>

                    </div>

                </div>


                <div class="mt-4">

                    <div
                        class="d-flex
                               justify-content-between
                               mb-1">

                        <small>
                            Progress
                        </small>

                        <strong>
                            ${Number(
                                project.progress || 0
                            )}%
                        </strong>

                    </div>


                    <div class="progress">

                        <div
                            class="progress-bar"
                            style="width:${Math.max(
                                0,
                                Math.min(
                                    100,
                                    Number(
                                        project.progress || 0
                                    )
                                )
                            )}%">

                        </div>

                    </div>

                </div>


                ${
                    links.length
                        ? `

                            <div
                                class="d-flex
                                       flex-wrap
                                       gap-2
                                       mt-4">

                                ${links.join("")}

                            </div>

                          `
                        : ""
                }

            </div>

        `,

        width:
            650,

        confirmButtonText:
            "Close"

    });

}


// ============================================================
// BUTTONS
// ============================================================

function initializeTrainingButtons(
    projects
) {

    document
        .querySelectorAll(
            ".view-training-btn"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const project =
                        projects.find(
                            item =>
                                item.id ===
                                button.dataset.projectId
                        );


                    if (project) {

                        viewTraining(
                            project
                        );

                    }

                }
            );

        });

}


// ============================================================
// LOAD
// ============================================================

async function loadTraining() {

    if (!trainingContainer) {

        console.warn(
            "trainingContainer not found."
        );

        return;

    }


    try {

        /*
         * Your supplied documents have:
         *
         * type: "project"
         *
         * Therefore this queries project documents.
         */

        const trainingQuery =
            query(

                collection(
                    db,
                    "projects"
                ),

                where(
                    "type",
                    "==",
                    "project"
                )

            );


        const snapshot =
            await getDocs(
                trainingQuery
            );


        if (snapshot.empty) {

            renderEmptyTraining();

            return;

        }


        const projects =
            snapshot.docs.map(
                projectDoc => ({

                    id:
                        projectDoc.id,

                    ...projectDoc.data()

                })
            );


        trainingContainer.innerHTML =
            projects
                .map(
                    renderTrainingCard
                )
                .join("");


        initializeTrainingButtons(
            projects
        );


        console.log(
            `FGSHUSOFT: ${projects.length} training/project records loaded.`
        );



    }

    catch (error) {

        console.error(
            "Failed to load training:",
            error
        );


        renderTrainingError();

    }

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
        loadTraining
    );
    
} else {
    loadTraining();
}

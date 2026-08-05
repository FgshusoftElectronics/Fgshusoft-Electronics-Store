import { navigate } from "./router.js";


export async function loadSidebar() {

    const response = await fetch(
        "templates/sidebar.html"
    );

    document.getElementById("sidebar").innerHTML =
        await response.text();


    document
    .querySelectorAll("#sidebar a[data-page]")
    .forEach(link => {

        link.addEventListener("click", e => {

            e.preventDefault();

            navigate(link.dataset.page);

        });

    });

}



export async function loadTopbar() {

    const response = await fetch(
        "templates/topbar.html"
    );


    document.getElementById("topbar").innerHTML =
        await response.text();

}

export async function loadFooter() {

    const response = await fetch("templates/footer.html");

    document.getElementById("footer").innerHTML =
        await response.text();

}

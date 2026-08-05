export async function loadSidebar() {

    const response = await fetch("templates/sidebar.html");

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

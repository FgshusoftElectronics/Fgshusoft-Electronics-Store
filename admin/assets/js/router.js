export async function navigate(module){

    showLoader();

    const response =
    await fetch(`modules/${module}/${module}.html`);

    const html =
    await response.text();

    document
    .getElementById("content")
    .innerHTML = html;

    hideLoader();

}

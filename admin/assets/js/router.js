import {showLoader, hideLoader} from "./loader.js";

export async function navigate(module){
    showLoader();
    try{
        const response = await fetch(
            `modules/${module}/${module}.html`
        );
        if(!response.ok){
            throw new Error(
                `${module}.html not found`
            );
        }
        const html = await response.text();
        document.getElementById("content").innerHTML = html;
    }
    catch(error){
        console.error(error);
        document.getElementById("content").innerHTML = `
        <div class="alert alert-danger">
        ${error.message}
        </div>
        `;
    }
    hideLoader();
}

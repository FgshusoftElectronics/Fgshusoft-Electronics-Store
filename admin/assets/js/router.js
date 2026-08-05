import { showLoader, hideLoader } from "./loader.js";


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


        const html =
        await response.text();


        document
        .getElementById("content")
        .innerHTML = html;



        // Update active menu

        document
        .querySelectorAll("#sidebar a")
        .forEach(link=>{


            link.classList.remove(
                "active"
            );


            if(link.dataset.page === module){

                link.classList.add(
                    "active"
                );

            }


        });



        // Update breadcrumb

        const breadcrumb =
        document.getElementById(
            "breadcrumb"
        );


        if(breadcrumb){

            breadcrumb.innerHTML = `

            <i class="fa-solid fa-house"></i>
            /
            ${module.charAt(0).toUpperCase()+module.slice(1)}

            `;
        }
    }

    catch(error){

        console.error(error);

        document
        .getElementById("content")
        .innerHTML = `

        <div class="alert alert-danger">

        <i class="fa-solid fa-triangle-exclamation"></i>

        ${error.message}

        </div>

        `;
    }

    hideLoader();
}

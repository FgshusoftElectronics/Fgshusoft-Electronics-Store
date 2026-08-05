import { showLoader, hideLoader } from "./loader.js";


export async function navigate(module){


    showLoader();


    try{


        // =========================
        // Load HTML module
        // =========================

        const htmlUrl =
        `modules/${module}/${module}.html?v=${Date.now()}`;


        const response =
        await fetch(htmlUrl);



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




        // =========================
        // Remove previous JS module
        // =========================

        const oldScript =
        document.getElementById(
            "module-script"
        );


        if(oldScript){

            oldScript.remove();

        }




        // =========================
        // Load JS if available
        // =========================

        const jsUrl =
        `modules/${module}/${module}.js?v=${Date.now()}`;


        const jsResponse =
        await fetch(jsUrl);



        if(jsResponse.ok){


            const script =
            document.createElement(
                "script"
            );


            script.type =
            "module";


            script.id =
            "module-script";


            script.src =
            jsUrl;



            document.body.appendChild(
                script
            );


        }






        // =========================
        // Active sidebar
        // =========================

        document
        .querySelectorAll(
            "#sidebar a"
        )
        .forEach(link=>{


            link.classList.remove(
                "active"
            );


            if(
            link.dataset.page === module
            ){

                link.classList.add(
                    "active"
                );

            }


        });






        // =========================
        // Breadcrumb
        // =========================

        const breadcrumb =
        document.getElementById(
            "breadcrumb"
        );



        if(breadcrumb){


            breadcrumb.innerHTML = `

            <i class="fa-solid fa-house"></i>

            /

            ${
            module.charAt(0).toUpperCase()
            +
            module.slice(1)
            }

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



    finally{


        hideLoader();


    }


}

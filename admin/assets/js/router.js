export async function navigate(module){
    showLoader();
    try{
        // Load HTML
        const response = await fetch(
            `modules/${module}/${module}.html`
        );
        const html = await response.text();
        document
        .getElementById("content")
        .innerHTML = html;
        // Load CSS
        const css =
        document.createElement("link");
        css.rel="stylesheet";
        css.href=
        `modules/${module}/${module}.css`;
        document.head.appendChild(css);
        // Load JS
        const script =
        document.createElement("script");
        script.type="module";
        script.src=
        `modules/${module}/${module}.js`;
        document.body.appendChild(script);
    }
    catch(error){
        document.getElementById("content").innerHTML=`
        <div class="alert alert-danger">
        <i class="fa-solid fa-triangle-exclamation"></i>
        Failed loading module:
        ${module}
        </div>
        `;
        console.error(error);
    }

    hideLoader();

}

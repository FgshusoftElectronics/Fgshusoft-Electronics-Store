// =====================================================
// APPLICATION LOADER
// =====================================================

export function updateLoader({

icon = "fa-shield-halved",  
title = "Secure Login",  
body = "Please wait...",  
progress = 0,  
footer = "Processing..."
}) {

  
  try{
const loader =  
    document.getElementById(  
        "loader"  
    );  

if (!loader) {  

    console.warn(  
        "Application loader not found."  
    );  

    return;  

}  


const iconElement =  
    document.getElementById(  
        "loaderIcon"  
    );  

const titleElement =  
    document.getElementById(  
        "loaderTitle"  
    );  

const bodyElement =  
    document.getElementById(  
        "loaderBody"  
    );  

const progressElement =  
    document.getElementById(  
        "loaderProgressBar"  
    );  

const progressText =  
    document.getElementById(  
        "loaderPercentage"  
    );  

const footerElement =  
    document.getElementById(  
        "loaderFooter"  
    );  

const progressWrapper =  
    document.querySelector(  
        ".loader-progress"  
    );  


loader.style.display =  
    "flex";  

loader.style.opacity =  
    "1";  

loader.style.visibility =  
    "visible";  

loader.style.pointerEvents =  
    "auto";  


if (iconElement) {  

    iconElement.className =  
        `fa-solid ${icon}`;  

}  


if (titleElement) {  

    titleElement.textContent =  
        title;  

}  


if (bodyElement) {  

    bodyElement.textContent =  
        body;  

}  


if (footerElement) {  

    footerElement.textContent =  
        footer;  

}  


const value = Math.max(  
        0,  
        Math.min(  
            100,  
            Number(progress) || 0  
        )  
    );  

if (progressElement) {  

    progressElement.style.width =  
        `${value}%`;  

}


if (progressText) {  

    progressText.textContent =  
        `${value}%`;  

}

if (progressWrapper) {  

    progressWrapper.setAttribute(  
        "aria-valuenow",  
        value  
    );  

}
}
catch(e){
    alert(e.message);
}
}


// =====================================================
// HIDE LOADER
// =====================================================

export function hideLoader(
delay = 0
) {

const loader =  
    document.getElementById(  
        "loader"  
    );  


if (!loader) {  

    return;  

}  


setTimeout(  
    () => {  

        loader.style.opacity =  
            "0";  

        loader.style.visibility =  
            "hidden";  

        loader.style.pointerEvents =  
            "none";  


        setTimeout(  
            () => {  

                loader.style.display =  
                    "none";  

            },  
            400  
        );  

    },  
    delay  
);

}

// =====================================================
// SHOW LOADER AGAIN
// =====================================================

export function showLoader() {

const loader =  
    document.getElementById(  
        "loader"  
    );  


if (!loader) {  

    return;  

}  


loader.style.display =  
    "flex";  

loader.style.opacity =  
    "1";  

loader.style.visibility =  
    "visible";  

loader.style.pointerEvents =  
    "auto";

}

import { 
    loginAdmin,
    checkAdminAuth
} from "./firebase-auth.js";




// =============================
// LOGIN PAGE
// =============================

const form = document.getElementById(
    "loginForm"
);


if(form){


form.addEventListener(
"submit",
async e=>{


e.preventDefault();



const email =
document.getElementById(
"email"
).value.trim();



const password =
document.getElementById(
"password"
).value;




try{


await loginAdmin(
email,
password
);



Swal.fire({

icon:"success",

title:"Welcome",

text:"Login successful",

timer:1200,

showConfirmButton:false

});



setTimeout(()=>{

window.location.href =
"index.html";

},1200);



}


catch(error){


Swal.fire({

icon:"error",

title:"Login Failed",

text:error.message

});


}



});


}




// =============================
// ADMIN PAGE PROTECTION
// =============================


const isAdminPage =
window.location.pathname.includes(
"/admin/index.html"
);



if(isAdminPage){


checkAdminAuth()
.catch(()=>{


window.location.href =
"login.html";


});


}

alert("Auth JS loaded");

alert(
"SweetAlert:"+
typeof Swal
);

import { 
    loginAdmin 
} from "./firebase-auth.js";



const form =
document.getElementById(
    "loginForm"
);



if(form){


form.addEventListener(
"submit",
async e=>{


e.preventDefault();



const email =
document
.getElementById("email")
.value
.trim();



const password =
document
.getElementById("password")
.value;



const button =
form.querySelector(
"button"
);




if(!email || !password){


Swal.fire({

icon:"warning",

title:"Missing Information",

text:"Please enter email and password"

});


return;

}




// Button loading

const oldText =
button.innerHTML;


button.disabled = true;


button.innerHTML = `

<span class="spinner-border spinner-border-sm"></span>

 Logging in...

`;



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



console.error(
"Login error:",
error
);



let message =
"Unable to login";



switch(error.code){


case "auth/invalid-email":

message =
"Invalid email format";

break;



case "auth/user-not-found":

message =
"No account found with this email";

break;



case "auth/wrong-password":

message =
"Incorrect password";

break;



case "auth/invalid-credential":

message =
"Invalid email or password";

break;



case "auth/too-many-requests":

message =
"Too many attempts. Try again later";

break;



default:

message =
error.message;

}



Swal.fire({

icon:"error",

title:"Login Failed",

text:message,

confirmButtonColor:"#0d6efd"

});




}



finally{


button.disabled = false;


button.innerHTML =
oldText;


}



});


}

import { 
    loginAdmin 
} from "./firebase-auth.js";



const form =
document.getElementById(
    "loginForm"
);



form.addEventListener(
"submit",
async e=>{


e.preventDefault();



const email =
document.getElementById(
"email"
).value;



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

timer:1500,

showConfirmButton:false

});



setTimeout(()=>{

location.href="index.html";

},1500);



}

catch(error){


Swal.fire({

icon:"error",

title:"Login Failed",

text:error.message

});


}



});

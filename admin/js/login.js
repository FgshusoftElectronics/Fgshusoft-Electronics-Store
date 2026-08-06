alert( new Date() );

document
.getElementById("loginForm")
.addEventListener("submit",(e)=>{
e.preventDefault();

const email =
document.getElementById("email").value;

const password =
document.getElementById("password").value;

// Temporary login

if(
email==="admin@fgshusoft.com" &&
password==="123456"
){

Swal.fire({

icon:"success",

title:"Welcome!",

text:"Login successful.",

timer:1500,

showConfirmButton:false

}).then(()=>{

location.href="dashboard.html";

});

}else{

Swal.fire({

icon:"error",

title:"Login Failed",

text:"Incorrect email or password."

});

}

});

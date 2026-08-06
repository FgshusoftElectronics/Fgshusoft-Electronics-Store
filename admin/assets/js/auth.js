import { loginAdmin } from "./firebase-auth.js";

const form = document.getElementById( "loginForm");

function showAlert( icon, title, text ){
    if(typeof Swal !== "undefined"){
        Swal.fire({ icon, title, text });
    }
    else{
        alert( `${title}\n\n${text}` );
    }
}

if(form){
form.addEventListener( "submit",
async e=>{

e.preventDefault();

const email = document.getElementById("email").value.trim();
const password = document.getElementById("password").value.trim();
const button = form.querySelector("button");

if(!email || !password){
showAlert( "warning", "Missing Information", "Please enter email and password" );
return;
}

// Button loading
const oldText = button.innerHTML;
button.disabled = true;
button.innerHTML = `
<span class="spinner-border spinner-border-sm"></span>
 Logging in...
`;

try{
const result = await loginAdmin( email, password );
console.log( "Logged in user:", result.user.email );

showAlert( "success", "Welcome", "Login successful" );

setTimeout(()=>{
window.location.href = "index.html";
},1200);
}
catch(error){
console.error( "Login error:", error );

let message = "Unable to login";
switch(error.code){
case "auth/invalid-email": message = "Invalid email format";break;
case "auth/user-not-found": message = "No account found with this email"; break;
case "auth/wrong-password": message = "Incorrect password"; break;
case "auth/invalid-credential": message = "Invalid email or password"; break;
case "auth/too-many-requests": message = "Too many attempts. Try again later"; break;
default: message =  error.message;
}

showAlert( "error", "Login Failed", message );
}
finally{
button.disabled = false;
button.innerHTML = oldText;
}
});
}

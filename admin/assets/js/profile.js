import { auth }from "./firebase.js";
 
auth.onAuthStateChanged( user=>{
const email =document.getElementById("adminEmail");
if(email && user){
email.innerHTML = user.email;
}
});


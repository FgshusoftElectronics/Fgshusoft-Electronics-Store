
import { checkAuth } from "./firebase-auth.js";

window.addEventListener(
"DOMContentLoaded",
async ()=>{
try{
  alert( new Date() );
  
await checkAuth();

loadSidebar();

loadTopbar();

loadFooter();

navigate("dashboard");

}

catch(error){
alert(error.message);
window.location.href =
"login.html";
}
});

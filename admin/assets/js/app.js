
import { checkAuth } from "./firebase-auth.js";

window.addEventListener(
"DOMContentLoaded",
async ()=>{
try{
 
await checkAuth();

loadSidebar();

loadTopbar();

loadFooter();

navigate("dashboard");

}

catch(e){
alert( "Error: " + e );
window.location.href =
"login.html";
}
});

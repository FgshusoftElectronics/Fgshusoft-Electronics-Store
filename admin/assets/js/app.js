import { checkAuth } from "./firebase-auth.js";
import { loadSidebar, loadTopbar, loadFooter } from "./ui.js";
import { navigate } from "./router.js";
import "./profile.js";
   
window.addEventListener(
"DOMContentLoaded",
async ()=>{

try{
await checkAuth();
await loadSidebar();
await loadTopbar();
await loadFooter();
await navigate("dashboard");
}
catch(error){
console.error(error);
window.location.href = "login.html";
}
});

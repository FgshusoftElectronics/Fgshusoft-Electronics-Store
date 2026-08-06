alert("Auth JS loaded");

alert(
"SweetAlert:"+
typeof Swal
);

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

catch(error){
alert(error.message);
window.location.href =
"login.html";
}
});

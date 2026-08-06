import { checkAuth } from "./firebase-auth.js";

import {
    loadSidebar,
    loadTopbar,
    loadFooter
} from "./ui.js";

import {
    navigate
} from "./router.js";

window.addEventListener(
"DOMContentLoaded",
async ()=>{
try{
await checkAuth();

await loadSidebar();

await loadTopbar();

await loadFooter();

navigate("dashboard");
}
catch(e){
alert(e.message);

window.location.href =
"login.html";
}
});

//import { checkAuth } from "./firebase-auth.js";

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
    alert( "Step 0" )
try{
//await checkAuth();
alert( "Step 1" )
await loadSidebar();
alert( "Step 2" )
await loadTopbar();
alert( "Step 3" )
await loadFooter();
alert( "Step 4" )
navigate("dashboard");
}
catch(e){
alert(e.message);
window.location.href =
"login.html";
}
});

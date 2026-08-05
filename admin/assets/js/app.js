import {checkAuth} from "./auth.js";
checkAuth();



import {
    loadSidebar,
    loadTopbar,
    loadFooter
} from "./ui.js";

import { navigate } from "./router.js";


window.addEventListener("DOMContentLoaded", async () => {

    await loadSidebar();

    await loadTopbar();

    await loadFooter();

    navigate("dashboard");

});

import { loadSidebar } from "./ui.js";

import { loadTopbar } from "./ui.js";

import { navigate } from "./router.js";

window.addEventListener("DOMContentLoaded", () => {

    loadSidebar();

    loadTopbar();

    navigate("dashboard");

});

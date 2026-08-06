try{

    await checkAuth();

    loadSidebar();

    loadTopbar();

    loadFooter();

    navigate("dashboard");

}

catch(e){

    alert(
        "Error: " + e.message
    );

    window.location.href =
    "login.html";

}

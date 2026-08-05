function updateClock(){

    const clock =
    document.getElementById(
        "liveClock"
    );


    if(clock){

        const now =
        new Date();


        clock.innerHTML =
        now.toLocaleTimeString();

    }

}


setInterval(
    updateClock,
    1000
);


updateClock();

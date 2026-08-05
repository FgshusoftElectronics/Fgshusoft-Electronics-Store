// Scroll Reveal Animation


const revealElements =
document.querySelectorAll(
".card, .stat-card, .category-card, .brand-card, .testimonial-card"
);



const revealObserver =
new IntersectionObserver(entries=>{


entries.forEach(entry=>{


if(entry.isIntersecting){

entry.target.classList.add("show");


}


});


});



revealElements.forEach(element=>{

element.classList.add("hidden");

revealObserver.observe(element);


});

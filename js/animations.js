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

const topBtn =
document.getElementById("topBtn");

window.addEventListener("scroll",()=>{
if(window.scrollY > 400){
topBtn.style.display="block";
}else{
topBtn.style.display="none";
}
});

topBtn.onclick=()=>{
window.scrollTo({
top:0,
behavior:"smooth"
});
};

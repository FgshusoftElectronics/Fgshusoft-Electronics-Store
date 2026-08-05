// Statistics Counter Animation

const counters =
document.querySelectorAll(".counter");

const startCounter = (counter)=>{
const target =
Number(counter.dataset.target);
let count = 0;
const speed = target / 100;

const update = ()=>{
if(count < target){
count += speed;
counter.innerText =
Math.ceil(count);
requestAnimationFrame(update);
}else{
counter.innerText =
target + "+";
}
};
update();
};

const observer =
new IntersectionObserver(entries=>{
entries.forEach(entry=>{
if(entry.isIntersecting){
startCounter(entry.target);
observer.unobserve(entry.target);
}
});
});
counters.forEach(counter=>{
observer.observe(counter);
});


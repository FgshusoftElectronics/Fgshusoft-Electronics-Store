export function loadSidebar(){

document.getElementById("sidebar").innerHTML=`

<div class="logo">

<i class="fa-solid fa-microchip"></i>

<h3>

FGSHUSOFT

</h3>

</div>

<nav>

<a onclick="navigate('dashboard')">

<i class="fa-solid fa-house"></i>

Dashboard

</a>

<a onclick="navigate('products')">

<i class="fa-solid fa-box"></i>

Products

</a>

<a onclick="navigate('orders')">

<i class="fa-solid fa-cart-shopping"></i>

Orders

</a>

<a onclick="navigate('customers')">

<i class="fa-solid fa-users"></i>

Customers

</a>

<a onclick="navigate('services')">

<i class="fa-solid fa-screwdriver-wrench"></i>

Services

</a>

<a onclick="navigate('training')">

<i class="fa-solid fa-graduation-cap"></i>

Training

</a>

</nav>

`;

}

export function loadTopbar(){

document.getElementById("topbar").innerHTML=`

<div class="d-flex justify-content-between">

<h4>

Fgshusoft Control Center

</h4>

<div>

🔔

👤 Administrator

</div>

</div>

`;

}

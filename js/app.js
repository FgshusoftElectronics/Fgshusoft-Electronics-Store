window.clientOrdersCache = [];
window.currentClientId = null;
let nName , pPhone;
import {
  auth,
  db,
 // signInWithEmailAndPassword,
  sendEmailVerification,
  doc,
  getDoc,
  getDocs,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  collection,
  onSnapshot,
  where, 
  serverTimestamp
} from "./js/firebase.js";

import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";

  //INITIAL LOAD
document.addEventListener("DOMContentLoaded", () => {
 loadAllProductsRealtime();
 updateCartBadge();
 loadAllOrdersRealtime();
});


// 🧩 Auth + Firestore load
onAuthStateChanged(auth, async (user) => {
/*
if (!user) {
  Swal.fire({
    icon: "warning",
    title: "Session expired",
    text: "Please log in again.",
    confirmButtonText: "OK",
    allowOutsideClick: false,
    allowEscapeKey: false
  }).then(() => {
    window.location.href = "login.html";
  });

  return;
}
*/
  if (!user) {
    Swal.fire({
      icon: "warning",
      title: "Session expired",
      text: "Please log in again."
    }).then(() => (
        window.location.href = "login.html"));
    return;
  }
  if (!user.emailVerified) {
    const res = await Swal.fire({
      icon: "warning",
      title: "Email Not Verified",
      html: `
        <p>Please verify your email to access this platform.</p>
        <small class="text-muted">${user.email}</small>
      `,
      showCancelButton: true,
      confirmButtonText: "Resend Verification",
      cancelButtonText: "Log out",
      allowOutsideClick: false
    });

    if (res.isConfirmed) {
      try {
        await sendEmailVerification(user);
        await Swal.fire(
          "Email Sent",
          "Verification email has been sent. Check your inbox.",
          "success"
        );
      } catch (err) {
        Swal.fire("Error", err.message, "error");
      }
    }

    await auth.signOut();
    window.location.href = "login.html";
    return;
  }

  uid = user.uid;
  userData = user;
});


// PRODUCT DATA
let products = [];
let orders = [];
//GLOBAL STATE
let cart = [];
let selectedProduct = null;
let unsubscribeOrders = null;

// ELEMENT REFERENCES
const productGrid = document.getElementById("productGrid");
const cartCountEl = document.getElementById("cartCount");
const cartItemsEl = document.getElementById("cartItems");
const cartTotalEl = document.getElementById("cartTotal");

// Filters 
const searchInput = document.getElementById("searchInput");
const categoryFilter = document.getElementById("categoryFilter");
const stockFilter = document.getElementById("stockFilter");
const priceFilter = document.getElementById("priceFilter");
const priceValue = document.getElementById("priceValue");


let unsubscribeProducts = null;

function isValidProduct(p) {
  return (
    typeof p.name === "string" &&
    p.name.trim().length > 1 &&
    typeof p.price === "number" &&
    p.price > 0 &&
    typeof p.image === "string" &&
    p.image.trim() !== "" &&
    p.createdAt
  );
}

window.loadAllProductsRealtime = function () {
  // 🧹 Stop previous listener if any
  if (unsubscribeProducts) {
    unsubscribeProducts();
    unsubscribeProducts = null;
  }

  // ⏳ Loader UI
  productGrid.innerHTML = `
    <div class="text-center py-5">
      <i class="fa fa-spinner fa-spin fa-2x text-muted"></i>
      <p class="text-muted mt-2">Loading products...</p>
    </div>
  `;

  const productsRef = collection(db, "products");

  // 🔥 REALTIME LISTENER (NO orderBy → NO INDEX)
  unsubscribeProducts = onSnapshot(
    productsRef,
    snap => {
      if (snap.empty) {
        products = [];
        productGrid.innerHTML = `
          <div class="text-center py-5 text-muted">
            <i class="fa fa-box-open fa-2x mb-2"></i>
            <p>No products available</p>
          </div>
        `;
        return;
      }

      // 📦 Normalize Firestore data
      products = snap.docs.map(doc => {
        const d = doc.data();
        return {
          id: doc.id,                     // 🔑 Firestore ID
          name: d.name ?? "Unnamed",
          price: Number(d.price) || 0,
          description: d.description ?? "",
          category: d.category ?? "other",
          stock: Boolean(d.stock),
          image: d.image || "https://via.placeholder.com/300",
          rating: Number(d.rating) || 0,
          createdAt: d.createdAt || null
        };
      }).filter(isValidProduct);


 // 🕒 Sort newest first (client-side)
  products.sort((a, b) =>
  (b.createdAt.seconds || 0) - (a.createdAt.seconds || 0)
);
      // 🔎 Apply search / filters / render
      applyFilters();
    },
    err => {
      console.error("Product listener failed:", err);
      productGrid.innerHTML = `
        <div class="text-center py-5 text-danger">
          <i class="fa fa-triangle-exclamation fa-2x mb-2"></i>
          <p>Failed to load products</p>
          <small class="opacity-75">${err.message}</small>
        </div>
      `;
    }
  );
};
// RENDER PRODUCTS
const categoryLabels = {
  arduino: `<i class="fa-solid fa-microchip me-1"></i> Arduino Board`,
  sensor: `<i class="fa-solid fa-temperature-half me-1"></i> Sensor`,
  module: `<i class="fa-solid fa-puzzle-piece me-1"></i> Module`,
  power: `<i class="fa-solid fa-bolt me-1"></i> Power Supply`
};

function renderStars(rating){
  let stars = "";
  for(let i=1;i<=5;i++){
    stars += `<i class="fa${i<=rating?'s':'r'} fa-star"></i>`;
  }
  return stars;
}

function renderProducts(list) {
  productGrid.innerHTML = "";

  if (!Array.isArray(list) || list.length === 0) {
    productGrid.innerHTML = `
      <div class="text-center py-5 text-muted">
        <i class="fa fa-box-open fa-4x mb-2"></i>
        <p>No products available</p>
      </div>
    `;
    return;
  }

  list.forEach((p, index) => {
    const card = document.createElement("div");
    card.className = "product animate__animated animate__fadeInUp";
    card.style.animationDelay = `${index * 0.08}s`;

    card.dataset.id = p.id; // 🔑 IMPORTANT

    card.innerHTML = `
      <span class="category-badge category-${p.category}">
        ${categoryLabels[p.category] || p.category}
      </span>

      <div class="rating">${renderStars(p.rating)}</div>

      <img
        src="${p.image || 'https://via.placeholder.com/300'}"
        alt="${p.name}"
        class="product-img"
      >

      <h3 class="product-title">${p.name}</h3>

      <p class="product-desc">${p.description || ""}</p>

      <div class="price">$${Number(p.price).toFixed(2)}</div>

      <button
        class="btn btn-primary w-100 add-to-cart"
        ${!p.stock ? "disabled" : ""}
      >
        <i class="fa fa-cart-plus me-1"></i>
        ${p.stock ? "Add to Cart" : "Out of Stock"}
      </button>
    `;

    productGrid.appendChild(card);
  });
}

productGrid.addEventListener("click", (e) => {
  const card = e.target.closest(".product");
  if (!card) return;

  const productId = card.dataset.id;
  if (!productId) return;

  // Image or title → open details
  if (
    e.target.classList.contains("product-img") ||
    e.target.classList.contains("product-title")
  ) {
    showProductDetail(productId);
  }

  // Add to cart
  if (e.target.closest(".add-to-cart")) {
    addToCart(productId);
  }
});

window.showProductDetail = function (id) {
  const product = products.find(p => p.id === id);
  if (!product) {
    Swal.fire("Error", "Product not found", "error");
    return;
  }

  document.getElementById("productDetailTitle").innerText = product.name;
  document.getElementById("productDetailImg").src =
    product.image || "https://via.placeholder.com/300";
  document.getElementById("productDetailDesc").innerText = product.description;
  document.getElementById("productDetailPrice").innerText =
    `$${product.price.toFixed(2)}`;

  const stockBadge = document.getElementById("productDetailStock");
  stockBadge.className =
    "badge " + (product.stock ? "bg-success" : "bg-danger");
  stockBadge.innerText = product.stock ? "In Stock" : "Out of Stock";

  const addBtn = document.getElementById("productDetailAddBtn");
  addBtn.disabled = !product.stock;
  addBtn.onclick = () => addToCart(product.id);

  new bootstrap.Modal(
    document.getElementById("productDetailModal")
  ).show();
};

window.addToCart = function (id) {
  const product = products.find(p => p.id === id);
  if (!product || !product.stock) return;

  const item = cart.find(i => i.id === id);
  if (item) item.qty++;
  else cart.push({ ...product, qty: 1 });

  updateCartBadge();
  renderCart();

  Swal.fire({
    toast: true,
    position: "top-end",
    icon: "success",
    title: product.name + " added to cart",
    showConfirmButton: false,
    timer: 1200
  });
};

function renderCart() {
  cartItemsEl.innerHTML = "";
  let total = 0;
  
  if (cart.length === 0) {
    cartItemsEl.innerHTML = `
      <tr>
        <td colspan="4" class="text-center text-muted">
          Your cart is empty
        </td>
      </tr>`;
    cartTotalEl.innerText = "0.00";
    return;
  }

  cart.forEach(item => {
    total += item.price * item.qty;

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>
        <strong>${item.name}</strong><br>
        <small class="text-muted">$${item.price.toFixed(2)}</small>
      </td>

      <td>
        <div class="input-group input-group-sm">
          <button class="btn btn-outline-secondary" onclick="changeQty('${item.id}', -1)">−</button>
          <input type="number" min="1" class="form-control text-center"
                 value="${item.qty}"
                 onchange="setQty('${item.id}', this.value)">
          <button class="btn btn-outline-secondary" onclick="changeQty('${item.id}', 1)">+</button>
        </div>
      </td>

      <td>
        $${(item.price * item.qty).toFixed(2)}
      </td>

      <td>
        <button class="btn btn-sm btn-danger" onclick="removeFromCart('${item.id}')">
          <i class="fa fa-trash"></i>
        </button>
      </td>
    `;
    cartItemsEl.appendChild(row);
  });

  cartTotalEl.innerText = total.toFixed(2);
}
window.changeQty = function (id, delta) {
  const item = cart.find(i => i.id === id);
  if (!item) return;

  item.qty += delta;
  if (item.qty < 1) removeFromCart(id);

  renderCart();
  updateCartBadge();
}

function setQty(id, value) {
  const item = cart.find(i => i.id === id);
  if (!item) return;

  const qty = parseInt(value);
  item.qty = qty > 0 ? qty : 1;

  renderCart();
  updateCartBadge();
}

window.removeFromCart = function (id) {
    const item = cart.find(i => i.id === id);

    if (!item) return;

    cart = cart.filter(i => i.id !== id);

    Swal.fire({
        icon: "success",
        title: "Item Removed",
        text: `${item.name} has been successfully removed.`,
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 1000,
        timerProgressBar: true
    });

    renderCart();
    updateCartBadge();
};
window.clearCart = function () {
  if (cart.length === 0) return;

  Swal.fire({
    title: "Clear cart?",
    text: "This will remove all items",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Yes, clear it"
  }).then(res => {
    if (res.isConfirmed) {
      cart = [];
      renderCart();
      updateCartBadge();
    }
  });
 hideCart();
}
function updateCartBadge() {
  cartCountEl.innerText = cart.reduce((sum, i) => sum + i.qty, 0);
}
// CART MODAL CONTROL (FIXED)
window.toggleCart = function () {
if (cart.length === 0) {
    Swal.fire({
        icon: "warning",
        title: "Cart is empty",
        text: "Please add some items first.",
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true
    });
    return;
}
    const modalEl = document.getElementById("cartModal");
    const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
    modal.toggle();
};
const cartModal = bootstrap.Modal.getOrCreateInstance(
    document.getElementById("cartModal")
);

window.showCart = () => cartModal.show();
window.hideCart = () => cartModal.hide();
//window.toggleCart = () => cartModal.toggle();
// WHATSAPP CHECKOUT
function checkoutWhatsApp() {
  if(cart.length === 0) return;

  let html = "<ul style='text-align:left'>";
  cart.forEach(i=>{
    html += `<li>${i.qty} × ${i.name} ($${i.price})</li>`;
  });
  html += `</ul><strong>Total: $${cartTotalEl.innerText}</strong>`;

  Swal.fire({
    title: "Confirm Order",
    html,
    icon: "info",
    showCancelButton: true,
    confirmButtonText: "Place Order",
  }).then(res=>{
    if(res.isConfirmed){
      let msg = "Order Details:\n";
      cart.forEach(i=>{
        msg += `${i.qty} × ${i.name} ($${i.price})\n`;
      });
      msg += `Total: $${cartTotalEl.innerText}`;

 sendTelegramAlert(msg);
 
     window.open(
        `https://wa.me/237698252340?text=${encodeURIComponent(msg)}`,
        "_blank"
      );
    }
  });
}
// TELEGRAM ALERT 
function sendTelegramAlert(message) {
    const botToken = "8548746480:AAHOsM4FtiutD8BTuhMEzgo7X1XIAlBva4w";
    const chatId = "8404185119";

    fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `chat_id=${chatId}&text=${encodeURIComponent(message)}&parse_mode=Markdown`
    }).catch(console.error);
   Swal.fire({
    toast: true,
    position: "top-end",
    icon: "success",
    title: "Your order has been sent successfully." ,
    showConfirmButton: false,
    timer: 1200
  });
}
// FILTERS
function applyFilters() {
  if (!products.length) {
    renderProducts([]);
    return alert("No products Available.");
  }

  const search = searchInput.value.toLowerCase().trim();
  const category = categoryFilter.value;
  const stock = stockFilter.value;
  const maxPrice = Number(priceFilter.value || Infinity);

  const filtered = products.filter(p => {
    return (
      (!search || p.name?.toLowerCase().includes(search)) &&
      (!category || p.category === category) &&
      (!stock ||
        (stock === "in" ? p.stock === true : p.stock === false)
      ) &&
      (p.price <= maxPrice)
    );
  });

  renderProducts(filtered);
}

searchInput.addEventListener("input", applyFilters);
categoryFilter.addEventListener("change", applyFilters);
stockFilter.addEventListener("change", applyFilters);
priceFilter.addEventListener("input", () => {
  priceValue.innerText = `$${priceFilter.value}`;
  applyFilters();
});

window.placeOrder = async function () {
  if (!cart.length) {
    return Swal.fire({
      icon: "info",
      title: "Cart is empty",
      text: "Please add products before placing an order"
    });
  }

  try {
    // 🔹 Client info
    const user = auth.currentUser;

    const client = {
      uid: user?.uid || null,
      email: user?.email ||
        "guest@client.com",
      phone: pPhone || "N/A",
      name: nName || "-"
    };

    // 🔹 Order object (Firestore-ready)
    const order = {
      client,
      status: "processing",
      items: cart.map(i => ({
        productId: i.id,
        name: i.name,
        qty: i.qty,
        price: i.price,
        total: i.price * i.qty
      })),
      total: cart.reduce((t, i) => t + i.price * i.qty, 0),
      createdAt: serverTimestamp(),
      source: "web"
    };

    // 🔹 SAVE TO FIRESTORE
    const ref = await addDoc(collection(db, "orders"), order);

    // 🔹 TELEGRAM MESSAGE (Markdown-safe)
    let msg = "*🛒 New Order Received*\n\n";
    msg += `*Order ID:* \`${ref.id}\`\n`;
    msg += `*Client:* ${client.email}\n*Name:* ${nName}\n`;
    msg += `*WhatsApp:* ${pPhone}\n\n`;

    msg += "```\n";
    msg += "Item               Qty   Price    Total\n";
    msg += "----------------------------------------\n";

    order.items.forEach(i => {
      msg +=
        `${i.name.substring(0,18).padEnd(18)} ` +
        `${String(i.qty).padEnd(5)} ` +
        `$${i.price.toFixed(2).padEnd(7)} ` +
        `$${i.total.toFixed(2)}\n`;
    });

    msg += "----------------------------------------\n";
    msg += `TOTAL                          $${order.total.toFixed(2)}\n`;
    msg += "```\n";
    msg += `\nFrom *${client.email}* ⚡`;

    sendTelegramAlert(msg);

    // 🔹 SUCCESS UI
    Swal.fire({
      icon: "success",
      title: "Order Placed",
      text: "Your order has been submitted successfully",
      timer: 1800,
      showConfirmButton: false
    });

    // 🔹 CLEAR CART
    cart = [];
    renderCart();
    updateCartBadge();

  } catch (err) {
    console.error("Order failed:", err);
    Swal.fire(
      "Order Failed",
      err.message || "Unable to place order",
      "error"
    );
  }
};
//////
let unsubscribeClientOrders = null;

window.loadAllOrdersRealtime = function () {
  const container = document.getElementById("clientOrders");
  const emailEl = document.getElementById("clientEmail");
  if (!container || !emailEl) return;

  // 🧹 Stop previous Firestore listener
  if (unsubscribeClientOrders) {
    unsubscribeClientOrders();
    unsubscribeClientOrders = null;
  }

  // ⏳ Loader
  container.innerHTML = `
    <div class="text-center py-5">
      <i class="fa fa-spinner fa-spin fa-2x text-muted"></i>
      <p class="text-muted mt-2">Loading your orders...</p>
    </div>
  `;

  // 🔐 Auth (run once)
  onAuthStateChanged(auth, user => {
    const email = user?.email?.toLowerCase() || "guest@test.com";
    const uid   = user?.uid || null;

    emailEl.textContent = email;

    const ordersRef = collection(db, "orders");

    // 🔥 REALTIME — NO where(), NO orderBy()
    unsubscribeClientOrders = onSnapshot(
      ordersRef,
      snap => {
        if (snap.empty) {
          container.innerHTML = `
            <div class="text-center py-5 text-muted">
              <i class="fa fa-box-open fa-2x mb-2"></i>
              <p>No orders found</p>
            </div>
          `;
          return;
        }

        // 📦 Normalize + client-side filter
        let orders = snap.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(o => {
            if (!user) return false;
            return o.client?.uid === uid;
          });

        if (!orders.length) {
          container.innerHTML = `
            <div class="alert alert-info text-center rounded-3 shadow-sm">
              <i class="fa fa-info-circle me-1"></i>
              No orders linked to <strong>${email}</strong>
            </div>
          `;
          return;
        }

        // 🕒 Sort newest first (client-side)
        orders.sort((a, b) =>
          (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)
        );

        renderClientOrders(orders);
      },
      err => {
        console.error("Orders listener failed:", err);
        container.innerHTML = `
          <div class="alert alert-danger text-center rounded-3">
            <i class="fa fa-triangle-exclamation me-1"></i>
            Failed to load orders<br>
            <small class="opacity-75">${err.message}</small>
          </div>
        `;
      }
    );
  });
};

function renderClientOrders(orders) {
  const container = document.getElementById("clientOrders");
  if (!container) return;

  // Empty state
  if (!orders.length) {
    container.innerHTML = `
      <div class="text-center py-5 text-muted">
        <i class="fa fa-box-open fa-4x mb-3"></i>
        <h5>No Orders Yet</h5>
        <p class="small">Your placed orders will appear here</p>
      </div>
    `;
    return;
  }

  // ✅ cache for View / Print
  window.clientOrdersCache = orders;

  container.innerHTML = "";

  const currency = v =>
    Number(v || 0).toLocaleString(undefined, {
      minimumFractionDigits: 2
    });

  orders.forEach(o => {
    const date =
      o.createdAt?.toDate?.().toLocaleString() ||
      new Date(o.createdAt).toLocaleString();

    const statusIcon =
      o.status === "processing" ? "spinner fa-spin" :
      o.status === "prepared"   ? "check-circle" :
      o.status === "cancelled"  ? "xmark-circle" :
      "clock";

    container.insertAdjacentHTML("beforeend", `
      <div class="card shadow-sm border-0 rounded-4 mb-4 animate__animated animate__fadeInUp" style="max-width: 100%;">

        <!-- HEADER -->
        <div class="card-header bg-light border-0 rounded-top-4">
          <div class="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-2">
            <div class="flex-grow-1">
              <strong class="text-dark d-block mb-1">
                <i class="fa fa-receipt me-1 text-primary"></i>
                Order #${o.id}
              </strong>
              <small class="text-muted d-block mb-1">${date}</small>
            </div>
            <span class="badge bg-${statusColor(o.status)} px-2 py-1 text-wrap text-center"
                  style="max-width: 120px; white-space: normal; font-size: 0.85rem;">
              <i class="fa fa-${statusIcon} me-1"></i>
              ${o.status.toUpperCase()}
            </span>
          </div>
        </div>

        <!-- BODY -->
        <div class="card-body">

          <!-- Order items -->
          <div class="order-items mb-3 d-flex flex-wrap gap-2">
            ${o.items.map(i => `
              <div class="d-flex flex-column flex-shrink-0 p-2 border rounded shadow-sm" style="min-width: 140px; max-width: 180px; flex: 1 1 auto;">
                <div class="d-flex align-items-center mb-1">
                  <i class="fa fa-cube text-muted me-1"></i>
                  <span class="fw-semibold text-truncate">${i.name}</span>
                </div>
                <small class="text-muted mb-1">Qty: ${i.qty}</small>
                <strong class="text-primary">$${currency(i.total)}</strong>
              </div>
            `).join("")}
          </div>

          <hr>

          <div class="d-flex justify-content-between align-items-center flex-wrap mb-3">
            <span class="fw-semibold text-muted mb-1 mb-md-0">
              <i class="fa fa-wallet me-1"></i>Total
            </span>
            <span class="fs-5 fw-bold text-primary">$${currency(o.total)}</span>
          </div>

          <!-- ACTION BUTTONS -->
          <div class="d-flex flex-wrap gap-2 justify-content-end">
            <button class="btn btn-outline-primary btn-sm"
                    onclick="showOrderDetail('${o.id}')">
              <i class="fa fa-eye me-1"></i> View
            </button>
            <button class="btn btn-success btn-sm"
                    onclick="printInvoice('${o.id}')">
              <i class="fa fa-print me-1"></i> Print Invoice
            </button>
          </div>

        </div>
      </div>
    `);
  });
}


window.logout = async function () {
  const result = await Swal.fire({
    title: "Logout?",
    text: "You will be signed out of your account.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Yes, Logout",
    cancelButtonText: "Cancel",
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    reverseButtons: true
  });

  if (!result.isConfirmed) return;

  try {
    await auth.signOut();

    await Swal.fire({
      icon: "success",
      title: "Logged out",
      text: "You have been logged out successfully.",
      timer: 1500,
      showConfirmButton: false
    });

    window.location.href = "login.html";
  } catch (error) {
    Swal.fire({
      icon: "error",
      title: "Logout failed",
      text: error.message || "Something went wrong"
    });
  }
};

// ----------------------
// VIEW ORDER DETAIL MODAL
// ----------------------
window.showOrderDetail = function (orderId) {
  const order = window.clientOrdersCache.find(o => o.id === orderId);

  if (!order) {
    Swal.fire("Order not found", "This order no longer exists.", "warning");
    return;
  }

  const itemsHtml = (order.items || []).map(i => `
    <div class="d-flex justify-content-between align-items-center py-2 border-bottom">
      <div>
        <div class="fw-semibold">${i.name}</div>
        <small class="text-muted">Qty: ${i.qty}</small>
      </div>
      <div class="fw-bold text-primary">
        $${Number(i.total).toFixed(2)}
      </div>
    </div>
  `).join("");

  Swal.fire({
    title: `Order #${order.id}`,
    html: `
      <div class="text-start">

        <!-- META INFO -->
        <div class="row g-2 mb-3">
          <div class="col-6">
            <small class="text-muted d-block">Status</small>
            <span class="badge bg-primary text-uppercase">
              ${order.status}
            </span>
          </div>
          <div class="col-6 text-end">
            <small class="text-muted d-block">Date</small>
            <span class="fw-semibold">
              ${order.createdAt?.toDate?.().toLocaleString() || ""}
            </span>
          </div>
        </div>

        <!-- ITEMS -->
        <div class="border rounded-3 p-3 mb-3" style="max-height:260px;overflow:auto;">
          ${itemsHtml}
        </div>

        <!-- TOTAL -->
        <div class="d-flex justify-content-between align-items-center fs-5 fw-bold">
          <span>Total</span>
          <span class="text-success">
            $${Number(order.total).toFixed(2)}
          </span>
        </div>

      </div>
    `,
    width: 540,
    confirmButtonText: "Close",
    showCloseButton: true,
    focusConfirm: false
  });
};

window.printInvoice = function (orderId) {
  const order = window.clientOrdersCache.find(o => o.id === orderId);
  if (!order) return;

  const company = {
    name: "Fgshusoft -Electronics",
    address: "Douala, Cameroon",
    phone: "+237 698 252 340",
    email: "support@Fgshusoftelectronics.com",
    website: "www.Fgshusoftelectronics.com"
  };
//alert(JSON.stringify( order))
  const customer = {
    name: order.client.name || "Valued Customer",
    phone: order.client.phone || "N/A",
    email: order.client.email || "N/A"
  };

  const subtotal = (order.items || []).reduce(
    (sum, i) => sum + Number(i.total || 0), 0
  );

  const tax = Number(order.tax || 0);
  const discount = Number(order.discount || 0);
  const grandTotal = subtotal + tax - discount;

  const itemsHtml = (order.items || []).map((i, idx) => `
    <tr>
      <td>${idx + 1}</td>
      <td>${i.name}</td>
      <td class="text-center">${i.qty}</td>
      <td class="text-end">$${Number(i.price).toFixed(2)}</td>
      <td class="text-end fw-semibold">$${Number(i.total).toFixed(2)}</td>
    </tr>
  `).join("");

  const html = `
<!DOCTYPE html>
<html>
<head>
  <title>Invoice #${order.id}</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
  <style>
    body { font-size: 14px; }
    .invoice-box { max-width: 900px; margin: auto; }
    .text-small { font-size: 13px; }
    @media print {
      .no-print { display: none; }
    }
  </style>
</head>

<body class="p-4">
<div class="invoice-box">

  <!-- COMPANY HEADER -->
  <div class="d-flex justify-content-between align-items-center border-bottom pb-3 mb-4">
    <div>
      <h3 class="mb-1">${company.name}</h3>
      <div class="text-muted text-small">
        ${company.address}<br>
        ${company.phone} • ${company.email}<br>
        ${company.website}
      </div>
    </div>
    <div class="text-end">
      <h5 class="mb-1">INVOICE</h5>
      <div class="text-small">
        <strong>Invoice #:</strong> ${order.id}<br>
        <strong>Date:</strong> ${order.createdAt?.toDate?.().toLocaleString() || ""}
      </div>
    </div>
  </div>

  <!-- CUSTOMER & STATUS -->
  <div class="row mb-4">
    <div class="col-md-6">
      <h6 class="text-uppercase text-muted">Bill To</h6>
      <strong>${customer.name}</strong><br>
      <span class="text-small">${customer.phone}</span><br>
      <span class="text-small">${customer.email}</span>
    </div>
    <div class="col-md-6 text-md-end mt-3 mt-md-0">
      <h6 class="text-uppercase text-muted">Order Status</h6>
      <span class="badge bg-primary text-uppercase px-3 py-2">
        ${order.status}
      </span>
    </div>
  </div>

  <!-- ITEMS -->
  <table class="table table-bordered align-middle">
    <thead class="table-light">
      <tr>
        <th>#</th>
        <th>Item</th>
        <th class="text-center">Qty</th>
        <th class="text-end">Price</th>
        <th class="text-end">Total</th>
      </tr>
    </thead>
    <tbody>
      ${itemsHtml}
    </tbody>
  </table>

  <!-- TOTAL SUMMARY -->
  <div class="row justify-content-end mt-3">
    <div class="col-md-5">
      <table class="table">
        <tr>
          <th>Subtotal</th>
          <td class="text-end">$${subtotal.toFixed(2)}</td>
        </tr>
        <tr>
          <th>Tax</th>
          <td class="text-end">$${tax.toFixed(2)}</td>
        </tr>
        <tr>
          <th>Discount</th>
          <td class="text-end text-danger">-$${discount.toFixed(2)}</td>
        </tr>
        <tr class="table-light">
          <th class="fs-5">Grand Total</th>
          <th class="text-end fs-5 text-success">
            $${grandTotal.toFixed(2)}
          </th>
        </tr>
      </table>
    </div>
  </div>

  <!-- FOOTER -->
  <div class="border-top pt-3 mt-4 text-center text-small text-muted">
    Thank you for choosing <strong>${company.name}</strong>.<br>
    Goods sold are not returnable unless stated otherwise.
  </div>

</div>
</body>
</html>
`;

  const win = window.open("", "_blank");
  win.document.write(html);
  win.document.close();
  win.focus();
  win.print();
};

function statusColor(status) {
  return {
    processing: "warning",
    confirmed: "primary",
    shipped: "info",
    completed: "success",
    cancelled: "danger"
  }[status] || "secondary";
}

const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

function setTheme(theme, save = false) {
  document.body.classList.toggle("dark", theme === "dark");
  if (save) localStorage.setItem("theme", theme);
}
// 1️⃣ Apply theme on load
(function initTheme() {
  const savedTheme = localStorage.getItem("theme");

  if (savedTheme === "dark" || savedTheme === "light") {
    setTheme(savedTheme);
  } else {
    setTheme(mediaQuery.matches ? "dark" : "light");
  }
})();
// 2️⃣ Listen to system theme changes
mediaQuery.addEventListener("change", e => {
  if (!localStorage.getItem("theme")) {
    setTheme(e.matches ? "dark" : "light");
  }
});
// 3️⃣ Manual toggle (overrides system)
window.toggleTheme = function () {
  const isDark = document.body.classList.contains("dark");
  setTheme(isDark ? "light" : "dark", true);
};
// 4️⃣ Optional: Reset to system theme
window.resetTheme = function () {
  localStorage.removeItem("theme");
  setTheme(mediaQuery.matches ? "dark" : "light");
};



// Real-time subscriber count
const subscriberCountEl = document.getElementById("subscriberCount");
const newsletterCol = collection(db, "newsletter");
const newsletterQuery = query(newsletterCol);

onSnapshot(newsletterQuery, snap => {
  const count = snap.size;
  subscriberCountEl.innerHTML = `<i class="fa fa-users me-1"></i> ${count-1} Subscribers`;
});


window.subscribeNewsletter = async function(event) {
  event.preventDefault();
  const emailInput = document.getElementById("newsletterEmail");
  const feedback = document.getElementById("newsletterFeedback");
  const email = emailInput.value.trim();

  // Basic email validation
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email)) {
    feedback.innerHTML = '<span class="text-danger">Invalid email address.</span>';
    return;
  }

  try {
    // Check if email already exists
    const colRef = collection(db, "newsletter");
    const q = query(colRef, where("email", "==", email));
    const snap = await getDocs(q);

    if (!snap.empty) {
      feedback.innerHTML = '<span class="text-warning">You are already subscribed!</span>';
      return;
    }

    // Add new subscription
    await addDoc(colRef, {
      email: email,
      subscribedAt: new Date()
    });

    feedback.innerHTML = '<span class="text-success">Subscribed successfully! 🎉</span>';
    emailInput.value = "";

  } catch (err) {
    console.error(err);
    feedback.innerHTML = '<span class="text-danger">Error subscribing. Try again later.</span>';
  }
};








let userID = 0;



export function getDocumentsData() {
  return new Promise((resolve, reject) => {

    onAuthStateChanged(auth, async (user) => {
      if (!user) {
        reject("No authenticated user");
        return;
      }

if( userID >0 ) return showClientInfo( user.uid );

      try {
        const docRef = doc(db, "clients", user.uid);
        const snap = await getDoc(docRef);

        if (!snap.exists()) {
          reject("Client document not found");
          return;
        }

        resolve({
          id: snap.id,
          ...snap.data()
        });

      } catch (error) {
        reject(error);
      }
    });

  });
}
window.showClientsAlert = async function () {
    
  if( userID > 0 ) await getDocumentsData();
  else {
      const c = await getDocumentsData();
pPhone = document.getElementById("clientPhone").innerHTML = c.phone;
nName = document.getElementById("clientName").innerHTML = c.fullName; 
document.getElementById("logo").src = `https://ui-avatars.com/api/?name=${encodeURIComponent(nName)}&background=0d6efd&color=fff`;
  }
  userID = 1;
}

showClientsAlert();

//   SHOW CLIENT INFO MODAL
window.showClientInfo = async function (clientId) {
 
 window.currentClientId = clientId; 
 
  const body = document.getElementById("clientInfoBody");
  const modal = new bootstrap.Modal(
    document.getElementById("clientInfoModal")
  );

  modal.show();

  body.innerHTML = `
    <div class="text-center py-4 text-muted">
      <i class="fa fa-spinner fa-spin"></i> Loading client data...
    </div>
  `;

  try {
    const ref = doc(db, "clients", clientId);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
      body.innerHTML = `
        <div class="alert alert-warning text-center">
          Client not found
        </div>
      `;
      return;
    }

    const c = snap.data();

    body.innerHTML = `
      <div class="row g-3">
        ${infoCard("ID", c.uid, "fa-id-badge")}
        ${infoCard("Full Name", c.fullName, "fa-user")}
        ${infoCard("Email", c.email, "fa-envelope")}
        ${infoCard("Phone", c.phone, "fa-phone")}
        ${infoCard("Login Method", c.loginMethod, "fa-key")}
        ${infoCard("Device", c.device, "fa-mobile-screen")}
        ${infoCard("IP Address", c.ip, "fa-network-wired")}
        ${infoCard("Created At", formatDate(c.createdAt), "fa-calendar-plus")}
        ${infoCard("Last Seen", formatDate(c.lastSeen), "fa-clock")}
        ${statusCard("Online Status", c.online)}

      </div>
    `;
 
  } catch (err) {
    console.error(err);
    body.innerHTML = `
      <div class="alert alert-danger text-center">
        Failed to load client information
      </div>
    `;
  }
};

function infoCard(label, value, icon) {
  return `
    <div class="col-md-6">
      <div class="border rounded-3 p-3 h-100">
        <small class="text-muted">
          <i class="fa-solid ${icon} me-1"></i> ${label}
        </small>
        <div class="fw-semibold mt-1">
          ${value ?? "—"}
        </div>
      </div>
    </div>
  `;
}

function statusCard(label, online) {
  return `
    <div class="col-md-6">
      <div class="border rounded-3 p-3 h-100">
        <small class="text-muted">
          <i class="fa-solid fa-signal me-1"></i> ${label}
        </small>
        <div class="mt-1">
          <span class="badge ${
            online ? "bg-success" : "bg-secondary"
          }">
            ${online ? "Online" : "Offline"}
          </span>
        </div>
      </div>
    </div>
  `;
}

function formatDate(ts) {
  if (!ts) return "—";
  return ts.toDate
    ? ts.toDate().toLocaleString()
    : new Date(ts).toLocaleString();
}

//HELPERS
function renderInfo(label, value) {
  return `
    <div class="col-md-6">
      <div class="border rounded-3 p-3 h-100">
        <small class="text-muted">${label}</small>
        <div class="fw-semibold">${value ?? "—"}</div>
      </div>
    </div>
  `;
}




// SAFE HELPERS
function safeDate(ts) {
  if (!ts) return "—";
  if (ts.seconds) return new Date(ts.seconds * 1000).toLocaleString();
  return new Date(ts).toLocaleString();
}

function safeStatus(status) {
  const map = {
    pending:  { label: "Pending",  cls: "warning" },
    paid:     { label: "Paid",     cls: "success" },
    shipped:  { label: "Shipped",  cls: "info" },
    canceled: { label: "Canceled", cls: "danger" }
  };
  return map[status] || { label: status || "Unknown", cls: "secondary" };
}

function renderItems(items = []) {
  if (!items.length) {
    return `<em class="text-muted">No items</em>`;
  }

  return `
    <table class="table table-sm mt-2">
      <thead class="table-light">
        <tr>
          <th>Product</th>
          <th>Qty</th>
          <th>Price</th>
          <th>Total</th>
        </tr>
      </thead>
      <tbody>
        ${items.map(i => `
          <tr>
            <td>${i.name || "Item"}</td>
            <td>${i.qty || 1}</td>
            <td>$${Number(i.price || 0).toFixed(2)}</td>
            <td>$${Number((i.qty || 1) * (i.price || 0)).toFixed(2)}</td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `;
}

// PRINT CLIENT PROFILE
window.printClientProfile1 = async function (clientId) {
  if (!clientId) return;

  /* 🔓 OPEN WINDOW FIRST (POPUP SAFE) */
  const win = window.open("", "_blank");
  if (!win) {
    alert("Popup blocked");
    return;
  }

  win.document.write(`
    <html>
      <head>
        <title>Preparing…</title>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
      </head>
      <body class="p-5 text-center">
        <div class="spinner-border"></div>
        <p class="mt-3">Preparing client profile…</p>
      </body>
    </html>
  `);

  try {
    /* ================= CLIENT ================= */
    const clientQ = query(
      collection(db, "clients"),
      where("uid", "==", clientId)
    );

    const clientSnap = await getDocs(clientQ);

    if (clientSnap.empty) {
      win.document.body.innerHTML = "<p>Client not found</p>";
      return;
    }

    const client = clientSnap.docs[0].data();

    /* ================= ORDERS ================= */
    const ordersQ = query(
      collection(db, "orders"),
      where("client.uid", "==", clientId)
    );

    const ordersSnap = await getDocs(ordersQ);

    let totalSpent = 0;
    const totalOrders = ordersSnap.docs.length;

    ordersSnap.docs.forEach(d => {
      totalSpent += Number(d.data().total || 0);
    });

    const ordersHtml = totalOrders
      ? ordersSnap.docs.map(d => {
          const o = d.data();
          const st = safeStatus(o.status);

          return `
            <div class="border rounded-3 p-3 mb-3">
              <div class="d-flex justify-content-between">
                <strong>Order #${d.id}</strong>
                <span class="badge bg-${st.cls}">${st.label}</span>
              </div>

              <div class="small text-muted mb-2">
                ${safeDate(o.createdAt)} • ${o.items?.length || 0} items
              </div>

              ${renderItems(o.items)}

              <div class="text-end fw-bold text-success mt-2">
                Order Total: $${Number(o.total || 0).toFixed(2)}
              </div>
            </div>
          `;
        }).join("")
      : `<p class="text-muted">No orders found</p>`;

    /* ================= RENDER ================= */
    win.document.open();
    win.document.write(`
<!DOCTYPE html>
<html>
<head>
  <title>${client.fullName || "Client"} – Profile</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
  <style>
    body { font-size: 14px }
    @media print { .no-print { display:none } }
  </style>
</head>

<body class="p-4">
<div class="container">

<h4 class="mb-0">Fgshusoft -Electronics</h4>
<small class="text-muted">Client Profile & Orders</small>
<hr>

<h5>Client Information</h5>

<div class="row g-3 mb-4">

  <div class="col-md-4">
    <div class="border rounded-3 p-3">
      <small class="text-muted">UID</small>
      <div class="fw-bold">${client.uid}</div>
    </div>
  </div>

  <div class="col-md-4">
    <div class="border rounded-3 p-3">
      <small class="text-muted">Full Name</small>
      <div class="fw-bold">${client.fullName}</div>
    </div>
  </div>

  <div class="col-md-4">
    <div class="border rounded-3 p-3">
      <small class="text-muted">Email</small>
      <div class="fw-bold">${client.email}</div>
    </div>
  </div>

  <div class="col-md-4">
    <div class="border rounded-3 p-3">
      <small class="text-muted">Phone</small>
      <div class="fw-bold">${client.phone || "—"}</div>
    </div>
  </div>

  <div class="col-md-4">
    <div class="border rounded-3 p-3">
      <small class="text-muted">Device</small>
      <div class="fw-bold">${client.device || "—"}</div>
    </div>
  </div>

  <div class="col-md-4">
    <div class="border rounded-3 p-3">
      <small class="text-muted">IP Address</small>
      <div class="fw-bold">${client.ip || "—"}</div>
    </div>
  </div>

  <div class="col-md-4">
    <div class="border rounded-3 p-3">
      <small class="text-muted">Created At</small>
      <div class="fw-bold">${safeDate(client.createdAt)}</div>
    </div>
  </div>

  <div class="col-md-4">
    <div class="border rounded-3 p-3">
      <small class="text-muted">Last Seen</small>
      <div class="fw-bold">${safeDate(client.lastSeen)}</div>
    </div>
  </div>

  <div class="col-md-4">
    <div class="border rounded-3 p-3 text-center">
      <small class="text-muted">Status</small>
      <div class="mt-1">
        <span class="badge bg-${client.online ? "success" : "secondary"}">
          ${client.online ? "Online" : "Offline"}
        </span>
      </div>
    </div>
  </div>

</div>

<h5 class="mt-4">Orders Summary</h5>

<div class="row g-3 mb-4">
  <div class="col-6">
    <div class="border rounded-3 p-3 text-center">
      <div class="fw-bold fs-5">${totalOrders}</div>
      <small class="text-muted">Total Orders</small>
    </div>
  </div>
  <div class="col-6">
    <div class="border rounded-3 p-3 text-center text-success">
      <div class="fw-bold fs-5">$${totalSpent.toFixed(2)}</div>
      <small class="text-muted">Total Spent</small>
    </div>
  </div>
</div>

${ordersHtml}

</div>

<script>
  window.onload = () => window.print();
</script>

</body>
</html>
    `);

    win.document.close();

  } catch (err) {
    console.error(err);
    win.document.body.innerHTML = `
      <h5 class="text-danger">Error loading profile</h5>
      <pre>${err.message}</pre>
    `;
  }
};

// PRINT CLIENT PROFILE
window.printClientProfile = async function (clientId) {
  if (!clientId) return;

  /* 🔓 OPEN WINDOW FIRST (POPUP SAFE) */
  const win = window.open("", "_blank");
  if (!win) {
    alert("Popup blocked");
    return;
  }

  win.document.write(`
    <html>
      <head>
        <title>Preparing…</title>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
      </head>
      <body class="p-5 text-center">
        <div class="spinner-border"></div>
        <p class="mt-3">Preparing client profile…</p>
      </body>
    </html>
  `);

  try {
    /* ================= CLIENT ================= */
    const clientQ = query(
      collection(db, "clients"),
      where("uid", "==", clientId)
    );

    const clientSnap = await getDocs(clientQ);
    if (clientSnap.empty) {
      win.document.body.innerHTML = "<p>Client not found</p>";
      return;
    }

    const client = clientSnap.docs[0].data();

    /* ================= ORDERS ================= */
    const ordersQ = query(
      collection(db, "orders"),
      where("client.uid", "==", clientId)
    );

    const ordersSnap = await getDocs(ordersQ);

    let totalSpent = 0;
    let delivered = 0;
    let cancelled = 0;
    let pending = 0;
    let firstOrderDate = null;
    let lastOrderDate = null;

    ordersSnap.docs.forEach(d => {
      const o = d.data();
      totalSpent += Number(o.total || 0);

      if (o.status === "delivered") delivered++;
      else if (o.status === "cancelled") cancelled++;
      else pending++;

      const t = o.createdAt?.toDate?.();
      if (t) {
        if (!firstOrderDate || t < firstOrderDate) firstOrderDate = t;
        if (!lastOrderDate || t > lastOrderDate) lastOrderDate = t;
      }
    });

    const totalOrders = ordersSnap.docs.length;
    const avgOrder = totalOrders ? (totalSpent / totalOrders).toFixed(2) : "0.00";

    const ordersHtml = totalOrders
      ? ordersSnap.docs.map(d => {
          const o = d.data();
          const st = safeStatus(o.status);

          return `
            <div class="border rounded-3 p-3 mb-3">
              <div class="d-flex justify-content-between">
                <strong>Order #${d.id}</strong>
                <span class="badge bg-${st.cls}">${st.label}</span>
              </div>

              <div class="small text-muted mb-2">
                ${safeDate(o.createdAt)} • ${o.items?.length || 0} items
              </div>

              ${renderItems(o.items)}

              <div class="text-end fw-bold text-success mt-2">
                Order Total: $${Number(o.total || 0).toFixed(2)}
              </div>
            </div>
          `;
        }).join("")
      : `<p class="text-muted">No orders found</p>`;

    /* ================= RENDER ================= */
    win.document.open();
    win.document.write(`
<!DOCTYPE html>
<html>
<head>
  <title>${client.fullName || "Client"} – Profile</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
  <style>
    body { font-size: 14px }
    @media print { .no-print { display:none } }
  </style>
</head>

<body class="p-4">
<div class="container">

<h4 class="mb-0">Fgshusoft -Electronics</h4>
<small class="text-muted">Client Profile & Orders</small>
<hr>

<h5>Client Information</h5>

<div class="row g-3 mb-4">
  ${[
    ["UID", client.uid],
    ["Full Name", client.fullName],
    ["Email", client.email],
    ["Phone", client.phone || "—"],
    ["Device", client.device || "—"],
    ["IP Address", client.ip || "—"],
    ["Created At", safeDate(client.createdAt)],
    ["Last Seen", safeDate(client.lastSeen)]
  ].map(i => `
    <div class="col-md-4">
      <div class="border rounded-3 p-3">
        <small class="text-muted">${i[0]}</small>
        <div class="fw-bold">${i[1]}</div>
      </div>
    </div>
  `).join("")}

  <div class="col-md-4">
    <div class="border rounded-3 p-3 text-center">
      <small class="text-muted">Status</small>
      <div class="mt-1">
        <span class="badge bg-${client.online ? "success" : "secondary"}">
          ${client.online ? "Online" : "Offline"}
        </span>
      </div>
    </div>
  </div>
</div>

<!-- ✅ POINT 2: CLIENT ANALYTICS -->
<h5>Client Analytics</h5>
<div class="row g-3 mb-4">
  <div class="col-4"><div class="border rounded-3 p-3 text-center"><small>Avg Order</small><div class="fw-bold">$${avgOrder}</div></div></div>
  <div class="col-4"><div class="border rounded-3 p-3 text-center text-success"><small>Delivered</small><div class="fw-bold">${delivered}</div></div></div>
  <div class="col-4"><div class="border rounded-3 p-3 text-center text-danger"><small>Cancelled</small><div class="fw-bold">${cancelled}</div></div></div>
  <div class="col-12"><div class="border rounded-3 p-3 text-center"><small>Order Period</small><div class="fw-bold">${firstOrderDate ? firstOrderDate.toLocaleDateString() : "—"} → ${lastOrderDate ? lastOrderDate.toLocaleDateString() : "—"}</div></div></div>
</div>

<!-- ✅ POINT 3: ACTIVITY TIMELINE -->
<h5>Activity Timeline</h5>
<div class="border rounded-3 p-3 mb-4">
  <ul class="list-unstyled small mb-0">
    <li>👤 Account created — <strong>${safeDate(client.createdAt)}</strong></li>
    <li>⏱ Last seen — <strong>${safeDate(client.lastSeen)}</strong></li>
    ${ordersSnap.docs.map(d => `
      <li>🧾 Order #${d.id} — ${safeDate(d.data().createdAt)}</li>
    `).join("")}
  </ul>
</div>

<h5 class="mt-4">Orders</h5>
${ordersHtml}

</div>

<script>
  window.onload = () => window.print();
</script>

</body>
</html>
    `);

    win.document.close();

  } catch (err) {
    console.error(err);
    win.document.body.innerHTML = `
      <h5 class="text-danger">Error loading profile</h5>
      <pre>${err.message}</pre>
    `;
  }
};

let firstOrderDate = null;
let lastOrderDate = null;
let delivered = 0;
let cancelled = 0;
let pending = 0;

ordersSnap.docs.forEach(d => {
  const o = d.data();
  const t = o.createdAt?.toDate?.() || null;

  if (t) {
    if (!firstOrderDate || t < firstOrderDate) firstOrderDate = t;
    if (!lastOrderDate || t > lastOrderDate) lastOrderDate = t;
  }

  if (o.status === "delivered") delivered++;
  else if (o.status === "cancelled") cancelled++;
  else pending++;
});

const avgOrder =
  totalOrders ? (totalSpent / totalOrders).toFixed(2) : "0.00";
  





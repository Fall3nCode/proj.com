const app = document.getElementById("app");

// STORAGE
let users = JSON.parse(localStorage.getItem("users")) || [];
let products = JSON.parse(localStorage.getItem("products")) || [];
let prescriptions = JSON.parse(localStorage.getItem("rx")) || [];
let currentUser = localStorage.getItem("currentUser");
let cart = [];

// INIT
if (currentUser) renderApp();
else renderAuth();

// AUTH UI
function renderAuth() {
  app.innerHTML = `
    <div class="glass">
      <h2>💊 PharmaCare Login</h2>
      <input id="user" placeholder="Username">
      <input id="pass" type="password" placeholder="Password">
      <button onclick="signup()">Signup</button>
      <button onclick="login()">Login</button>
    </div>
  `;
}

// SIGNUP
function signup() {
  users.push({ user: user.value, pass: pass.value });
  localStorage.setItem("users", JSON.stringify(users));
  alert("Signup successful");
}

// LOGIN
function login() {
  const found = users.find(u => u.user === user.value && u.pass === pass.value);
  if (found) {
    localStorage.setItem("currentUser", found.user);
    renderApp();
  } else alert("Invalid login");
}

// MAIN APP
function renderApp() {
  app.innerHTML = `
    <h2>💊 PharmaCare</h2>

    <input id="search" placeholder="Search drugs..." oninput="searchProduct()">

    <div id="products"></div>

    <div class="glass">
      <h3>Cart</h3>
      <div id="cart"></div>
      <p>Total: ₦<span id="total">0</span></p>
      <input id="address" placeholder="Delivery Address">
      <button onclick="pay()">Pay Now</button>
      <button onclick="whatsappOrder()">WhatsApp Order</button>
    </div>

    <div class="glass">
      <h3>Upload Prescription</h3>
      <input type="file" id="file">
      <button onclick="upload()">Upload</button>
      <div id="prescriptions"></div>
    </div>

    <div class="glass">
      <h4>📍 Port Harcourt</h4>
      <p>☎️ 08148991764</p>
      <p>🕒 8AM - 10PM</p>
      <p>✅ Approved by Pharmacist</p>
    </div>

    <button onclick="renderAdmin()">Admin</button>
    <button onclick="toggleDark()">🌙</button>
    <button onclick="logout()">Logout</button>
  `;

  renderProducts();
  renderCart();
  showPrescriptions();
}

// PRODUCTS
function renderProducts(list = products) {
  const container = document.getElementById("products");
  container.innerHTML = "";

  list.forEach(p => {
    container.innerHTML += `
      <div class="card">
        <img src="${p.img}" width="100%" loading="lazy">
        <h3>${p.name}</h3>
        <p>₦${p.price}</p>
        <p>⭐ ${p.rating || 0}</p>
        <button onclick="addToCart(${p.id})">Add</button>
      </div>
    `;
  });
}

// SEARCH
function searchProduct() {
  const value = document.getElementById("search").value.toLowerCase();
  const filtered = products.filter(p => p.name.toLowerCase().includes(value));
  renderProducts(filtered);
}

// CART
function addToCart(id) {
  const p = products.find(x => x.id === id);
  cart.push(p);
  renderCart();
}

function renderCart() {
  const cartDiv = document.getElementById("cart");
  const totalEl = document.getElementById("total");

  cartDiv.innerHTML = "";
  let total = 0;

  cart.forEach((item, i) => {
    total += item.price;

    cartDiv.innerHTML += `
      <p>${item.name} - ₦${item.price}
      <button onclick="remove(${i})">X</button></p>
    `;
  });

  totalEl.innerText = total;
}

function remove(i) {
  cart.splice(i, 1);
  renderCart();
}

// PAYMENT
function pay() {
  let total = cart.reduce((sum, i) => sum + i.price, 0);

  PaystackPop.setup({
    key: "YOUR_PUBLIC_KEY",
    email: "customer@email.com",
    amount: total * 100,
    currency: "NGN",
    callback: function () {
      app.innerHTML = `
        <div class="glass">
          <h2>✅ Payment Successful</h2>
          <p>Your drugs are on the way 🚚</p>
        </div>
      `;
    }
  }).openIframe();
}

// WHATSAPP
function whatsappOrder() {
  let msg = "Order:%0A" + cart.map(i => i.name).join("%0A");
  window.open(`https://wa.me/2348148991764?text=${msg}`);
}

// PRESCRIPTION
function upload() {
  const file = document.getElementById("file").files[0];
  if (!file) return;

  prescriptions.push(file.name);
  localStorage.setItem("rx", JSON.stringify(prescriptions));
  showPrescriptions();
}

function showPrescriptions() {
  const div = document.getElementById("prescriptions");
  if (!div) return;

  div.innerHTML = prescriptions.map(p => `<p>${p}</p>`).join("");
}

// ADMIN
function renderAdmin() {
  app.innerHTML = `
    <h2>Admin Dashboard</h2>

    <input id="name" placeholder="Drug name">
    <input id="price" placeholder="Price">
    <input id="img" placeholder="Image URL">

    <button onclick="addProduct()">Add</button>

    <div id="adminList"></div>
    <button onclick="renderApp()">Back</button>
  `;

  renderAdminList();
}

function addProduct() {
  products.push({
    id: Date.now(),
    name: name.value,
    price: Number(price.value),
    img: img.value,
    rating: 5
  });

  localStorage.setItem("products", JSON.stringify(products));
  renderAdminList();
}

function renderAdminList() {
  const list = document.getElementById("adminList");
  list.innerHTML = "";

  products.forEach(p => {
    list.innerHTML += `
      <p>${p.name} - ₦${p.price}
      <button onclick="deleteProduct(${p.id})">❌</button></p>
    `;
  });
}

function deleteProduct(id) {
  products = products.filter(p => p.id !== id);
  localStorage.setItem("products", JSON.stringify(products));
  renderAdminList();
}

// DARK MODE
function toggleDark() {
  document.body.classList.toggle("dark");
}

// LOGOUT
function logout() {
  localStorage.removeItem("currentUser");
  location.reload();
}
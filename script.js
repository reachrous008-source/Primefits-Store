/* ============================================================
   PRIME KITS PREMIUM — JERSEY SHOP
   script.js — All app logic
   ============================================================ */

// ── STATE ──────────────────────────────────────────────────
let products  = JSON.parse(localStorage.getItem('pk_products'))  || getSampleProducts();
let orders    = JSON.parse(localStorage.getItem('pk_orders'))    || [];
let cart      = JSON.parse(localStorage.getItem('pk_cart'))      || [];

let currentFilter  = 'all';
let currentSearch  = '';
let currentProduct = null; // product open in modal

// ── SAMPLE PRODUCTS ────────────────────────────────────────
function getSampleProducts() {
  return [
    {
      id: 'p1',
      name: 'Brazil Home 2026',
      price: 49.99,
      description: 'The iconic yellow and green kit of the Seleção. Premium breathable fabric, slim fit, authentic crest embroidery.',
      category: 'national',
      image: 'https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=600&q=80',
    },
    {
      id: 'p2',
      name: 'Manchester United Away',
      price: 54.99,
      description: 'Classic red-and-white away strip. Pre-match treatment fabric, moisture-wicking technology, embroidered badge.',
      category: 'club',
      image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80',
    },
    {
      id: 'p3',
      name: 'France World Cup 1998',
      price: 39.99,
      description: 'Retro classic. Celebrate Les Bleus\' first World Cup glory. 100% cotton construction, vintage badge, all-time iconic.',
      category: 'retro',
      image: 'https://images.unsplash.com/photo-1508609349937-5ec4ae374ebf?w=600&q=80',
    },
    {
      id: 'p4',
      name: 'Argentina Home 2025',
      price: 52.99,
      description: 'The famous light-blue-and-white stripes of La Albiceleste. Champion edition with three-star embroidery.',
      category: 'national',
      image: 'https://images.unsplash.com/photo-1576858574144-9ae1ebcf5ae5?w=600&q=80',
    },
    {
      id: 'p5',
      name: 'Real Madrid Home',
      price: 57.99,
      description: 'Los Blancos\' iconic all-white home strip. Advanced Dri-FIT ADV technology, 15x Champions League edition.',
      category: 'club',
      image: 'https://images.unsplash.com/photo-1556906781-9a414e2a7735?w=600&q=80',
    },
    {
      id: 'p6',
      name: 'AC Milan 1994 Retro',
      price: 44.99,
      description: 'Timeless black and red. Relive the Sacchi-era dominance with this premium retro kit. Limited run.',
      category: 'retro',
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&q=80',
    },
  ];
}

// ── INIT ───────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  renderProducts();
  renderCartCount();
  renderOrders();
  initFilterTabs();
  initSearch();
  initHamburger();
});

// ── PRODUCTS ───────────────────────────────────────────────
function saveProducts() {
  localStorage.setItem('pk_products', JSON.stringify(products));
}

function renderProducts() {
  const grid  = document.getElementById('productGrid');
  const empty = document.getElementById('emptyShop');
  const q     = currentSearch.toLowerCase().trim();

  let filtered = products.filter(p => {
    const matchCat    = currentFilter === 'all' || p.category === currentFilter;
    const matchSearch = !q || p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q);
    return matchCat && matchSearch;
  });

  if (filtered.length === 0) {
    grid.innerHTML  = '';
    empty.style.display = 'block';
    return;
  }
  empty.style.display = 'none';

  grid.innerHTML = filtered.map((p, i) => `
    <div class="product-card" onclick="openProduct('${p.id}')">
      <div class="product-image-wrap">
        ${p.image
          ? `<img src="${escHtml(p.image)}" alt="${escHtml(p.name)}" loading="lazy" onerror="this.parentElement.innerHTML='<div class=\\'no-image\\'><span>👕</span><p>No Image</p></div>'" />`
          : `<div class="no-image"><span>👕</span><p>No Image</p></div>`
        }
        <span class="cat-badge">${p.category}</span>
      </div>
      <div class="product-info">
        <p class="product-name">${escHtml(p.name)}</p>
        <p class="product-price">$${Number(p.price).toFixed(2)}</p>
        <div class="product-actions">
          <button class="btn-view" onclick="event.stopPropagation(); openProduct('${p.id}')">View Details</button>
          <button class="btn-cart-quick" title="Add to cart" onclick="event.stopPropagation(); addToCart('${p.id}')">🛒</button>
        </div>
      </div>
    </div>
  `).join('');
}

// ── FILTER TABS ────────────────────────────────────────────
function initFilterTabs() {
  document.querySelectorAll('.filter-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-tab').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.dataset.cat;
      renderProducts();
    });
  });
}

// ── SEARCH ─────────────────────────────────────────────────
function initSearch() {
  const bar = document.getElementById('searchBar');
  if (!bar) return;
  bar.addEventListener('input', () => {
    currentSearch = bar.value;
    renderProducts();
  });
}

// ── ADD PRODUCT (ADMIN) ────────────────────────────────────
async function addProduct(e) {
  e.preventDefault();

  const name     = document.getElementById('prodName').value.trim();
  const price    = parseFloat(document.getElementById('prodPrice').value);
  const category = document.getElementById('prodCategory').value;
  const desc     = document.getElementById('prodDesc').value.trim();
  const imageUrl = document.getElementById('prodImageUrl').value.trim();
  const fileInput = document.getElementById('prodImageFile');

  let imageData = imageUrl || '';

  if (!imageUrl && fileInput.files && fileInput.files[0]) {
    imageData = await toBase64(fileInput.files[0]);
  }

  const product = {
    id: 'p' + Date.now(),
    name, price, category, description: desc, image: imageData,
  };

  products.unshift(product);
  saveProducts();
  renderProducts();

  // Reset form
  document.getElementById('productForm').reset();
  showFlash('✓ Product added successfully!');
}

function toBase64(file) {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload  = () => res(r.result);
    r.onerror = rej;
    r.readAsDataURL(file);
  });
}

// ── PRODUCT MODAL ──────────────────────────────────────────
function openProduct(id) {
  const p = products.find(x => x.id === id);
  if (!p) return;
  currentProduct = p;

  const content = document.getElementById('modalContent');
  content.innerHTML = `
    <div class="modal-img-wrap">
      ${p.image
        ? `<img src="${escHtml(p.image)}" alt="${escHtml(p.name)}" onerror="this.parentElement.innerHTML='<div style=\\'display:flex;align-items:center;justify-content:center;height:100%;font-size:64px;opacity:0.2\\'>👕</div>'" />`
        : `<div style="display:flex;align-items:center;justify-content:center;height:100%;font-size:80px;opacity:0.15">👕</div>`
      }
    </div>
    <div class="modal-details">
      <p class="modal-cat">${p.category}</p>
      <h2 class="modal-name">${escHtml(p.name)}</h2>
      <p class="modal-price">$${Number(p.price).toFixed(2)}</p>
      <p class="modal-desc">${escHtml(p.description || 'Premium quality football jersey.')}</p>
      <div class="modal-actions">
        <button class="btn-primary" onclick="openOrderModal('${p.id}')">ORDER NOW →</button>
        <button class="btn-secondary" onclick="addToCart('${p.id}'); closeProductModal()">ADD TO CART 🛒</button>
      </div>
    </div>
  `;

  document.getElementById('productModal').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal(e) {
  if (e.target === document.getElementById('productModal')) closeProductModal();
}
function closeProductModal() {
  document.getElementById('productModal').classList.remove('open');
  document.body.style.overflow = '';
}

// ── ORDER MODAL ────────────────────────────────────────────
function openOrderModal(id) {
  const p = products.find(x => x.id === id) || currentProduct;
  if (!p) return;
  currentProduct = p;

  closeProductModal();

  document.getElementById('orderProductName').textContent = p.name + ' — $' + Number(p.price).toFixed(2);
  document.getElementById('orderModal').classList.add('open');
  document.getElementById('orderFormContent').style.display = '';
  document.getElementById('orderSuccess').style.display = 'none';
  document.getElementById('orderForm').reset();
  document.getElementById('orderQty').value = 1;
  updateOrderTotal();
  document.body.style.overflow = 'hidden';

  document.getElementById('orderQty').addEventListener('input', updateOrderTotal);
}

function updateOrderTotal() {
  if (!currentProduct) return;
  const qty = parseInt(document.getElementById('orderQty').value) || 1;
  const total = (qty * currentProduct.price).toFixed(2);
  document.getElementById('orderTotal').textContent = '$' + total;
}

function closeOrderModal(e) {
  if (e && e.target !== document.getElementById('orderModal')) return;
  document.getElementById('orderModal').classList.remove('open');
  document.body.style.overflow = '';
}

function submitOrder(e) {
  e.preventDefault();
  if (!currentProduct) return;

  const name     = document.getElementById('orderName').value.trim();
  const phone    = document.getElementById('orderPhone').value.trim();
  const qty      = parseInt(document.getElementById('orderQty').value);
  const location = document.getElementById('orderLocation').value.trim();
  const total    = (qty * currentProduct.price).toFixed(2);

  const order = {
    id: 'ORD-' + Date.now(),
    date: new Date().toLocaleString(),
    productId: currentProduct.id,
    productName: currentProduct.name,
    price: currentProduct.price,
    qty, total, name, phone, location,
  };

  orders.unshift(order);
  localStorage.setItem('pk_orders', JSON.stringify(orders));
  renderOrders();

  document.getElementById('orderFormContent').style.display = 'none';
  document.getElementById('orderSuccess').style.display = 'flex';
}

// ── ORDERS (ADMIN LIST) ────────────────────────────────────
function renderOrders() {
  const list = document.getElementById('orderList');
  if (!list) return;

  if (orders.length === 0) {
    list.innerHTML = '<p class="empty-msg">No orders yet.</p>';
    return;
  }

  list.innerHTML = orders.map(o => `
    <div class="order-card">
      <p class="order-id">${escHtml(o.id)} · ${escHtml(o.date)}</p>
      <p><strong>${escHtml(o.productName)}</strong> × ${o.qty} = <strong>$${o.total}</strong></p>
      <p>👤 ${escHtml(o.name)} · 📞 ${escHtml(o.phone)}</p>
      <p>📍 ${escHtml(o.location)}</p>
    </div>
  `).join('');
}

function clearOrders() {
  if (!confirm('Clear all orders?')) return;
  orders = [];
  localStorage.setItem('pk_orders', JSON.stringify(orders));
  renderOrders();
}

// ── CART ───────────────────────────────────────────────────
function addToCart(id) {
  const p = products.find(x => x.id === id);
  if (!p) return;

  const existing = cart.find(c => c.id === id);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ id: p.id, name: p.name, price: p.price, image: p.image, qty: 1 });
  }

  localStorage.setItem('pk_cart', JSON.stringify(cart));
  renderCartCount();
  renderCartItems();
  showFlash('✓ Added to cart!');
}

function removeFromCart(id) {
  cart = cart.filter(c => c.id !== id);
  localStorage.setItem('pk_cart', JSON.stringify(cart));
  renderCartCount();
  renderCartItems();
}

function changeCartQty(id, delta) {
  const item = cart.find(c => c.id === id);
  if (!item) return;
  item.qty = Math.max(1, item.qty + delta);
  localStorage.setItem('pk_cart', JSON.stringify(cart));
  renderCartCount();
  renderCartItems();
}

function clearCart() {
  if (!confirm('Clear your cart?')) return;
  cart = [];
  localStorage.setItem('pk_cart', JSON.stringify(cart));
  renderCartCount();
  renderCartItems();
}

function renderCartCount() {
  const total = cart.reduce((sum, c) => sum + c.qty, 0);
  const badge = document.getElementById('cartCount');
  badge.textContent = total;
  badge.classList.toggle('visible', total > 0);
}

function renderCartItems() {
  const container = document.getElementById('cartItems');
  const footer    = document.getElementById('cartFooter');

  if (cart.length === 0) {
    container.innerHTML = '<p class="empty-msg">Your cart is empty.</p>';
    footer.style.display = 'none';
    return;
  }

  footer.style.display = 'flex';
  container.innerHTML = cart.map(c => `
    <div class="cart-item">
      ${c.image
        ? `<img class="cart-item-img" src="${escHtml(c.image)}" alt="${escHtml(c.name)}" onerror="this.style.display='none'" />`
        : `<div class="cart-item-img" style="display:flex;align-items:center;justify-content:center;font-size:28px">👕</div>`
      }
      <div class="cart-item-info">
        <p class="cart-item-name">${escHtml(c.name)}</p>
        <p class="cart-item-price">$${Number(c.price).toFixed(2)} each</p>
        <div class="cart-item-qty">
          <button class="qty-btn" onclick="changeCartQty('${c.id}', -1)">−</button>
          <span class="qty-num">${c.qty}</span>
          <button class="qty-btn" onclick="changeCartQty('${c.id}', 1)">+</button>
          <button class="qty-btn" style="margin-left:8px;color:#ff6b6b" onclick="removeFromCart('${c.id}')">✕</button>
        </div>
      </div>
    </div>
  `).join('');

  const grand = cart.reduce((s, c) => s + c.price * c.qty, 0);
  document.getElementById('cartTotal').textContent = '$' + grand.toFixed(2);
}

function openCart() {
  renderCartItems();
  document.getElementById('cartOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeCart(e) {
  if (e && e.target !== document.getElementById('cartOverlay')) return;
  document.getElementById('cartOverlay').classList.remove('open');
  document.body.style.overflow = '';
}

function checkoutCart() {
  if (cart.length === 0) return;
  // Build a summary order
  const totalAmt = cart.reduce((s, c) => s + c.price * c.qty, 0).toFixed(2);
  alert(`Thank you! Your cart total is $${totalAmt}.\nOur team will contact you to arrange delivery.`);
  cart = [];
  localStorage.setItem('pk_cart', JSON.stringify(cart));
  renderCartCount();
  renderCartItems();
  document.getElementById('cartOverlay').classList.remove('open');
  document.body.style.overflow = '';
}

document.getElementById('cartBtn').addEventListener('click', openCart);

// ── ADMIN PANEL ────────────────────────────────────────────
function toggleAdmin() {
  document.getElementById('adminPanel').classList.toggle('open');
  if (document.getElementById('adminPanel').classList.contains('open')) {
    document.getElementById('adminPanel').scrollIntoView({ behavior: 'smooth' });
  }
}
document.getElementById('adminToggle').addEventListener('click', toggleAdmin);

// ── MOBILE NAV ─────────────────────────────────────────────
function initHamburger() {
  document.getElementById('hamburger').addEventListener('click', () => {
    document.getElementById('mobileNav').classList.toggle('open');
  });
}
function closeMobileNav() {
  document.getElementById('mobileNav').classList.remove('open');
}

// ── FLASH TOAST ────────────────────────────────────────────
function showFlash(msg) {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.style.cssText = `
      position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%);
      background: #1a1a1a; border: 1px solid #c9a84c; color: #c9a84c;
      font-family: 'Barlow Condensed', sans-serif; font-size: 13px;
      font-weight: 700; letter-spacing: 2px; text-transform: uppercase;
      padding: 12px 28px; border-radius: 4px; z-index: 9999;
      transition: opacity 0.3s ease; pointer-events: none;
    `;
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.style.opacity = '1';
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => { toast.style.opacity = '0'; }, 2500);
}

// ── UTILITY ─────────────────────────────────────────────────
function escHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ── KEYBOARD CLOSE ─────────────────────────────────────────
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    closeProductModal();
    document.getElementById('orderModal').classList.remove('open');
    document.getElementById('cartOverlay').classList.remove('open');
    document.body.style.overflow = '';
  }
});

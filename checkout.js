/* ==========================================================================
  Nit Gifts - Checkout Process Controllers
  ========================================================================== */

// Immediately check security condition (before DOM parses to avoid flash of empty checkout page)
const initialCart = JSON.parse(localStorage.getItem('cart') || '[]');
if (initialCart.length === 0) {
 window.location.replace('cart.html');
}

// 1. Dynamic Toast Notification System (Self-correcting: creates container if missing)
function showToast(title, description = "") {
 let container = document.getElementById('toast-container');
 if (!container) {
  container = document.createElement('div');
  container.id = 'toast-container';
  container.className = 'toast-container';
  document.body.appendChild(container);
 }

 const toastCard = document.createElement('div');
 toastCard.className = 'toast-card';
 toastCard.style.flexDirection = 'column';
 toastCard.style.alignItems = 'flex-start';
 toastCard.style.gap = '4px';

 // Toast inner content compiling (title and description)
 let descHTML = '';
 if (description) {
  descHTML = `<span style="font-size: 12px; color: rgba(255,255,255,0.7); font-weight: 400;">${description}</span>`;
 }

 toastCard.innerHTML = `
  <div style="display: flex; align-items: center; gap: 8px; width: 100%;">
   <i data-lucide="check" class="icon-sm" style="color: var(--color-accent);"></i>
   <span style="font-weight: 700;">${title}</span>
  </div>
  ${descHTML}
 `;

 container.appendChild(toastCard);

 if (window.lucide) {
  window.lucide.createIcons();
 }

 // Trigger visual slide-in
 setTimeout(() => {
  toastCard.classList.add('show');
 }, 10);

 // Trigger dismissal and cleanup after 4 seconds
 setTimeout(() => {
  toastCard.classList.remove('show');
  toastCard.classList.add('hide');

  toastCard.addEventListener('transitionend', () => {
   toastCard.remove();
  });
 }, 4000);
}

// 2. Render Checkout Summary Content
function loadCheckoutSummary() {
 const cart = JSON.parse(localStorage.getItem('cart') || '[]');
 const listContainer = document.getElementById('checkout-items-list');
 const subtotalEl = document.getElementById('summary-subtotal');
 const shippingEl = document.getElementById('summary-shipping');
 const totalEl = document.getElementById('summary-total');

 if (!listContainer) return;

 listContainer.innerHTML = '';

 cart.forEach(item => {
  const itemRow = document.createElement('div');
  itemRow.className = 'checkout-summary-item';

  itemRow.innerHTML = `
   <div class="checkout-summary-item-img-wrapper">
    <img src="${item.image}" alt="${item.name}" class="checkout-summary-item-img">
   </div>
   <div class="checkout-summary-item-info">
    <p class="checkout-summary-item-name">${item.name}</p>
    <p class="checkout-summary-item-qty">Qtd: ${item.qty}</p>
   </div>
   <span class="checkout-summary-item-price">R$ ${(item.price * item.qty).toFixed(2).replace('.', ',')}</span>
  `;

  listContainer.appendChild(itemRow);
 });

 // Calculate Prices Breakdown
 const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
 const shipping = subtotal > 200 ? 0 : 19.90;
 const total = subtotal + shipping;

 if (subtotalEl) {
  subtotalEl.textContent = `R$ ${subtotal.toFixed(2).replace('.', ',')}`;
 }

 if (shippingEl) {
  shippingEl.textContent = shipping === 0 ? 'Grátis' : `R$ ${shipping.toFixed(2).replace('.', ',')}`;
 }

 if (totalEl) {
  totalEl.textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;
 }
}

// 3. Form Submission Handler (simulating checkout pipeline)
function initCheckoutForm() {
 const form = document.getElementById('checkout-form');
 const submitBtn = document.getElementById('submit-order-btn');
 const spinner = document.getElementById('submit-spinner');
 const btnText = document.getElementById('submit-btn-text');

 if (!form || !submitBtn) return;

 form.addEventListener('submit', (e) => {
  e.preventDefault();

  // Trigger submitting visual states
  submitBtn.disabled = true;
  if (spinner) spinner.style.display = 'inline-block';
  if (btnText) btnText.style.display = 'none';

  // Simulating backend pipeline processing
  setTimeout(() => {
   // Clear Cart Data
   localStorage.setItem('cart', '[]');
   window.dispatchEvent(new Event('cart-updated'));

   // Set page-persistent success message flag to trigger on next homepage load
   localStorage.setItem('orderSuccessToast', 'true');

   // Navigate back to Homepage
   window.location.replace('index.html');
  }, 1500);
 });
}

// 4. Initializer Lifecycle
document.addEventListener('DOMContentLoaded', () => {
 // Populate summaries
 loadCheckoutSummary();

 // Bind forms pipeline
 initCheckoutForm();

 // Render static Lucide icons
 if (window.lucide) {
  window.lucide.createIcons();
 }
});

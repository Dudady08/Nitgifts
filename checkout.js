import { auth, db, doc, getDoc, onAuthStateChanged } from './firebase-config.js';

const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyUrmbaRzwqRku-QT7j_V1tqNMuheBB4zkNDJynJy7iV7bnF3FJ4JE6hgeZ2vTuN5bDfA/exec";
let userData = null;

// 1. Dynamic Toast Notification System
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

 setTimeout(() => {
  toastCard.classList.add('show');
 }, 10);

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

// 3. Form Submission Handler
function initCheckoutForm() {
 const form = document.getElementById('checkout-form');
 const submitBtn = document.getElementById('submit-order-btn');
 const spinner = document.getElementById('submit-spinner');
 const btnText = document.getElementById('submit-btn-text');

 if (!form || !submitBtn) return;

 form.addEventListener('submit', (e) => {
  e.preventDefault();

  if (!userData) {
   showToast("Aguarde", "Carregando dados do usuário...");
   return;
  }

  const cart = JSON.parse(localStorage.getItem('cart') || '[]');
  if (cart.length === 0) return; 

  // Trigger submitting visual states
  submitBtn.disabled = true;
  if (spinner) spinner.style.display = 'inline-block';
  if (btnText) btnText.style.display = 'none';

  // Processar Itens e Total
  let cartText = cart.map(item => `${item.qty}x ${item.name} (R$ ${item.price.toFixed(2).replace('.', ',')})`).join('\n');
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const shipping = subtotal > 200 ? 0 : 19.90;
  const formattedTotal = `R$ ${(subtotal + shipping).toFixed(2).replace('.', ',')}`;

  // Prepara os dados
  const formData = new URLSearchParams();
  formData.append('tipo_formulario', 'checkout');
  formData.append('nome', userData.name || '');
  formData.append('email', userData.email || '');
  formData.append('telefone', userData.phone || '');
  formData.append('cep', userData.address?.cep || '');
  formData.append('endereco', userData.address?.street || '');
  formData.append('numero', userData.address?.number || '');
  formData.append('complemento', userData.address?.complement || '');
  formData.append('cidade', userData.address?.city || '');
  formData.append('estado', userData.address?.state || '');
  formData.append('itens', cartText);
  formData.append('total', formattedTotal);

  console.log("Enviando Pedido para o Google Apps Script...");

  fetch(GOOGLE_SCRIPT_URL, {
   method: 'POST',
   mode: 'cors',
   cache: 'no-cache',
   headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
   },
   redirect: 'follow',
   body: formData.toString()
  }).then(() => console.log("Fetch de Pedido enviado."))
    .catch(err => console.error("Erro no fetch de Pedido:", err));

  setTimeout(() => {
   localStorage.setItem('cart', '[]');
   window.dispatchEvent(new Event('cart-updated'));
   localStorage.setItem('orderSuccessToast', 'true');
   window.location.replace('index.html');
  }, 1500);
 });
}

// 4. Load user data from Firestore
function showAddressError(message) {
 const skeleton = document.getElementById('user-address-skeleton');
 if (skeleton) {
  skeleton.innerHTML = `
   <p style="text-align: center; color: #c0392b; font-size: 14px; font-weight: 600;">${message}</p>
   <a href="register.html" style="display: block; text-align: center; margin-top: 8px; font-size: 13px; color: var(--color-primary);">Criar nova conta com endereço</a>
  `;
 }
}

function loadUserAddress(user) {
 getDoc(doc(db, "users", user.uid))
  .then((userDoc) => {
   if (userDoc.exists()) {
    userData = userDoc.data();

    const skeleton = document.getElementById('user-address-skeleton');
    const container = document.getElementById('user-address-container');

    if (skeleton) skeleton.style.display = 'none';
    if (container) container.style.display = 'block';

    const nameEl = document.getElementById('display-name');
    const streetEl = document.getElementById('display-street');
    const cityEl = document.getElementById('display-city');
    const phoneEl = document.getElementById('display-phone');

    if (nameEl) nameEl.textContent = userData.name || 'Sem nome';
    if (streetEl) {
     const addr = userData.address || {};
     streetEl.textContent = `${addr.street || 'Endereço não informado'}, ${addr.number || 's/n'} ${addr.complement ? '(' + addr.complement + ')' : ''}`;
    }
    if (cityEl) {
     const addr = userData.address || {};
     cityEl.textContent = `${addr.city || ''} - ${addr.state || ''} | CEP: ${addr.cep || ''}`;
    }
    if (phoneEl) phoneEl.textContent = `Tel: ${userData.phone || 'Não informado'}`;
   } else {
    console.error("Usuário não tem documento no Firestore.");
    showAddressError("Seus dados de endereço não foram encontrados.");
   }
  })
  .catch((error) => {
   console.error("Erro ao buscar endereço:", error);
   showAddressError("Erro ao carregar seus dados. Verifique sua conexão.");
  });
}

// 5. Firebase Auth State Listener (module-level, fires immediately)
onAuthStateChanged(auth, (user) => {
 if (user) {
  loadUserAddress(user);
 } else {
  window.location.replace('login.html');
 }
});

// 6. Initializer Lifecycle
document.addEventListener('DOMContentLoaded', () => {
 const initialCart = JSON.parse(localStorage.getItem('cart') || '[]');
 if (initialCart.length === 0) {
  window.location.replace('cart.html');
  return;
 }

 loadCheckoutSummary();
 initCheckoutForm();

 if (window.lucide) {
  window.lucide.createIcons();
 }
});

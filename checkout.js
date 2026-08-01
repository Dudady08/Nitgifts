import { auth, db, doc, getDoc, onAuthStateChanged, collection, addDoc } from './firebase-config.js';

const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyUrmbaRzwqRku-QT7j_V1tqNMuheBB4zkNDJynJy7iV7bnF3FJ4JE6hgeZ2vTuN5bDfA/exec";
const PAGBANK_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxwuC7xGX5YJX9u8DYxi0zm6hxKSF2GxevgkAtrkWscb1srBA3KIjvxy-NYZtWDfWJ8vQ/exec";
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

// 3. Form Submission Handler (Integrado com PagBank)
function initCheckoutForm() {
 const form = document.getElementById('checkout-form');
 const submitBtn = document.getElementById('submit-order-btn');
 const spinner = document.getElementById('submit-spinner');
 const btnText = document.getElementById('submit-btn-text');

 if (!form || !submitBtn) return;

 form.addEventListener('submit', async (e) => {
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

  let cartText = cart.map(item => `${item.qty}x ${item.name} (R$ ${item.price.toFixed(2).replace('.', ',')})`).join('\n');
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const shipping = subtotal > 200 ? 0 : 19.90;
  const formattedTotal = `R$ ${(subtotal + shipping).toFixed(2).replace('.', ',')}`;
  const formattedShipping = shipping === 0 ? 'Grátis' : `R$ ${shipping.toFixed(2).replace('.', ',')}`;

  // Data do pedido
  const now = new Date();
  const orderDate = now.toLocaleDateString('pt-BR', {
   day: '2-digit', month: '2-digit', year: 'numeric',
   hour: '2-digit', minute: '2-digit'
  });

  // Montar endereço completo
  const addr = userData.address || {};

  // ──── 1. Enviar para Google Apps Script (planilha + email — em paralelo) ────
  const formData = new URLSearchParams();
  formData.append('tipo_formulario', 'checkout');
  formData.append('nome', userData.name || '');
  formData.append('email', userData.email || '');
  formData.append('telefone', userData.phone || '');
  formData.append('data_pedido', orderDate);
  formData.append('cep', addr.cep || '');
  formData.append('endereco', addr.street || '');
  formData.append('numero', addr.number || '');
  formData.append('complemento', addr.complement || '');
  formData.append('cidade', addr.city || '');
  formData.append('estado', addr.state || '');
  formData.append('itens', cartText);
  formData.append('frete', formattedShipping);
  formData.append('total', formattedTotal);

  console.log("Enviando Pedido para a Planilha...");

  // Dispara registro na planilha/email em paralelo (não bloqueia o checkout)
  fetch(GOOGLE_SCRIPT_URL, {
   method: 'POST',
   mode: 'cors',
   cache: 'no-cache',
   headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
   },
   redirect: 'follow',
   body: formData.toString()
  }).then(() => console.log("Fetch de Planilha enviado."))
    .catch(err => console.error("Erro no fetch de Planilha:", err));

  // ──── 2. Salvar pedido no Firestore para histórico ────
  try {
   const user = auth.currentUser;
   if (user) {
    await addDoc(collection(db, "users", user.uid, "orders"), {
     items: cart.map(item => ({
      name: item.name,
      qty: item.qty,
      price: item.price,
      image: item.image || ''
     })),
     subtotal: subtotal,
     shipping: shipping,
     total: subtotal + shipping,
     createdAt: new Date().toISOString(),
     status: "pendente_pagamento"
    });
    console.log("Pedido salvo no Firestore (pendente_pagamento).");
   }
  } catch (firestoreErr) {
   console.error("Erro ao salvar pedido no Firestore:", firestoreErr);
  }

  // ──── 3. Criar Checkout no PagBank via Google Apps Script NOVO ────
  try {
   console.log("Criando checkout no PagBank...");

   // Determinar a URL de retorno (mesma origem do site + success.html)
   const returnUrl = window.location.origin + window.location.pathname.replace('checkout.html', 'success.html');

   const pagbankData = new URLSearchParams();
   pagbankData.append('nome', userData.name || '');
   pagbankData.append('email', userData.email || '');
   pagbankData.append('telefone', userData.phone || '');
   pagbankData.append('cpf', userData.cpf || '');
   pagbankData.append('items', JSON.stringify(cart.map(item => ({
    name: item.name,
    qty: item.qty,
    price: item.price
   }))));
   pagbankData.append('reference_id', 'NITGIFT-' + Date.now());
   pagbankData.append('return_url', returnUrl);

   const pagbankResponse = await fetch(PAGBANK_SCRIPT_URL, {
    method: 'POST',
    mode: 'cors',
    cache: 'no-cache',
    headers: {
     'Content-Type': 'application/x-www-form-urlencoded',
    },
    redirect: 'follow',
    body: pagbankData.toString()
   });

   const responseText = await pagbankResponse.text();
   let result;
   try {
    result = JSON.parse(responseText);
   } catch (parseErr) {
    console.error("Resposta não-JSON do GAS:", responseText);
    throw new Error("Resposta inesperada do servidor.");
   }

   if (result.success && result.pay_url) {
    localStorage.setItem('pendingOrder', JSON.stringify({
     checkout_id: result.checkout_id,
     items: cart,
     total: subtotal + shipping,
     date: orderDate
    }));

    console.log("Redirecionando para PagBank:", result.pay_url);
    window.location.href = result.pay_url;
   } else {
    const errorMsg = result.error || "Erro ao processar pagamento.";
    console.error("Erro PagBank:", errorMsg);
    showToast("Erro no pagamento", errorMsg);

    submitBtn.disabled = false;
    if (spinner) spinner.style.display = 'none';
    if (btnText) btnText.style.display = 'flex';
   }

  } catch (pagbankErr) {
   console.error("Exceção ao criar checkout PagBank:", pagbankErr);
   showToast("Erro de conexão", "Não foi possível conectar ao servidor de pagamento. Tente novamente.");

   submitBtn.disabled = false;
   if (spinner) spinner.style.display = 'none';
   if (btnText) btnText.style.display = 'flex';
  }
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
   if (userDoc.exists() && userDoc.data().address) {
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
    // Perfil incompleto (ex: logou pelo google e pulou) -> força preencher o endereço
    window.location.replace('complete-profile.html');
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

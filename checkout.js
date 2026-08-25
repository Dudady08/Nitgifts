import { auth, db, doc, getDoc, onAuthStateChanged, collection, addDoc, setDoc } from './firebase-config.js';

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

  // Abrir a janela do PagBank AGORA (no contexto do clique) para evitar bloqueio de popup
  const pagbankWindow = window.open('about:blank', '_blank');

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
  
  // ──── 1. Salvar pedido no Firestore para histórico e para o Webhook ────
  let orderId = 'NITGIFT-' + Date.now();
  let userUid = 'GUEST';

  try {
   const user = auth.currentUser;
   if (user) {
    userUid = user.uid;
    // Criamos a referência do documento ANTES para sabermos qual o ID
    const newOrderRef = doc(collection(db, "users", user.uid, "orders"));
    orderId = newOrderRef.id;

    await setDoc(newOrderRef, {
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
    console.log("Pedido salvo no Firestore (pendente_pagamento). ID:", orderId);
   }
  } catch (firestoreErr) {
   console.error("Erro ao salvar pedido no Firestore:", firestoreErr);
  }

  // ──── 2. Criar Checkout no PagBank (o Webhook fará o resto) ────
  try {
   console.log("Criando checkout no PagBank...");

   const returnUrl = window.location.origin + window.location.pathname.replace('checkout.html', 'success.html');

   const pagbankData = new URLSearchParams();
   pagbankData.append('tipo_formulario', 'pagbank_checkout');
   pagbankData.append('nome', userData.name || '');
   pagbankData.append('email', userData.email || '');
   pagbankData.append('telefone', userData.phone || '');
   pagbankData.append('cpf', userData.cpf || '');
   
   // Formato JSON estruturado que a API do PagBank exige
   const itemsForPagBank = cart.map(item => ({
    name: item.name,
    qty: item.qty,
    price: item.price
   }));

   // Adicionar o Frete como um item extra no PagBank (se não for grátis)
   if (shipping > 0) {
    itemsForPagBank.push({
     name: "Frete Fixo",
     qty: 1,
     price: shipping
    });
   }

   pagbankData.append('items', JSON.stringify(itemsForPagBank));
   
   // Enviamos TODOS os dados do formulário para o script novo guardar no Cache
   pagbankData.append('data_pedido', orderDate);
   pagbankData.append('cep', addr.cep || '');
   pagbankData.append('endereco', addr.street || '');
   pagbankData.append('numero', addr.number || '');
   pagbankData.append('complemento', addr.complement || '');
   pagbankData.append('cidade', addr.city || '');
   pagbankData.append('estado', addr.state || '');
   pagbankData.append('itens', cartText);
   pagbankData.append('frete', formattedShipping);
   pagbankData.append('total', formattedTotal);

   // O reference_id carrega o UID e o OrderID para o Webhook saber quem atualizar
   const reference_id = `${userUid}_${orderId}`;
   pagbankData.append('reference_id', reference_id);
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
    if (pagbankWindow) pagbankWindow.close();
    console.error("Resposta não-JSON do GAS:", responseText);
    throw new Error("Resposta inesperada do servidor.");
   }

   if (result.success && result.pay_url) {
    localStorage.setItem('pendingOrder', JSON.stringify({
     checkout_id: result.checkout_id,
     reference_id: reference_id,
     pay_url: result.pay_url,
     userUid: userUid,
     orderId: orderId,
     items: cart,
     total: subtotal + shipping,
     date: orderDate,
     // Dados para enviar à planilha/email após pagamento
     formData: {
      nome: userData.name || '',
      email: userData.email || '',
      telefone: userData.phone || '',
      data_pedido: orderDate,
      cep: addr.cep || '',
      endereco: addr.street || '',
      numero: addr.number || '',
      complemento: addr.complement || '',
      cidade: addr.city || '',
      estado: addr.state || '',
      itens: cartText,
      frete: formattedShipping,
      total: formattedTotal
     }
    }));

    // ── Salvar pay_url no Firestore para retomada de pagamento pelo perfil ──
    try {
     const user = auth.currentUser;
     if (user && orderId) {
      const orderRef = doc(db, "users", user.uid, "orders", orderId);
      await setDoc(orderRef, { pay_url: result.pay_url }, { merge: true });
      console.log("pay_url salvo no Firestore para retomada.");
     }
    } catch (saveUrlErr) {
     console.warn("Não foi possível salvar pay_url no Firestore:", saveUrlErr);
    }

    console.log("Abrindo PagBank em nova aba:", result.pay_url);
    
    // Tenta redirecionar a aba que já abrimos
    if (pagbankWindow) {
     pagbankWindow.location.href = result.pay_url;
    }
    
    // Pequeno atraso para dar tempo do navegador processar o popup antes de mudar a página atual
    setTimeout(() => {
     window.location.href = 'success.html';
    }, 500);
   } else {
    if (pagbankWindow) pagbankWindow.close();
    const errorMsg = result.error || "Erro ao processar pagamento.";
    console.error("Erro PagBank:", errorMsg);
    showToast("Erro no pagamento", errorMsg);

    submitBtn.disabled = false;
    if (spinner) spinner.style.display = 'none';
    if (btnText) btnText.style.display = 'flex';
   }

  } catch (pagbankErr) {
   if (pagbankWindow) pagbankWindow.close();
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

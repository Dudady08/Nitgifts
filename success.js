// ============================================================================
// Nit Gifts — Success Page Controller (Retorno do PagBank)
// ============================================================================

import { auth, db, doc, getDoc, setDoc, onAuthStateChanged } from './firebase-config.js';

const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyUrmbaRzwqRku-QT7j_V1tqNMuheBB4zkNDJynJy7iV7bnF3FJ4JE6hgeZ2vTuN5bDfA/exec";
const PAGBANK_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxwuC7xGX5YJX9u8DYxi0zm6hxKSF2GxevgkAtrkWscb1srBA3KIjvxy-NYZtWDfWJ8vQ/exec";

// 1. Toast Notification System
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

// 2. Mostrar overlay de pagamento aprovado
function showApprovalOverlay() {
 const overlay = document.createElement('div');
 overlay.className = 'payment-overlay';
 overlay.innerHTML = `
  <div class="payment-overlay-card">
   <div class="payment-overlay-icon">
    <i data-lucide="check-circle" style="width: 64px; height: 64px; color: #059669;"></i>
   </div>
   <h2 class="payment-overlay-title">Pagamento Aprovado!</h2>
   <p class="payment-overlay-text">Seu pedido foi confirmado com sucesso. Você receberá uma notificação em breve.</p>
   <button class="btn payment-overlay-btn" onclick="document.querySelector('.payment-overlay').remove()">Entendi</button>
  </div>
 `;
 document.body.appendChild(overlay);

 // Animar entrada
 requestAnimationFrame(() => {
  overlay.classList.add('show');
 });

 if (window.lucide) {
  window.lucide.createIcons();
 }
}

// 3. Atualizar status do pedido no Firestore para "pago"
async function updateOrderStatus(userUid, orderId) {
 if (!userUid || userUid === 'GUEST' || !orderId) return;

 try {
  const orderRef = doc(db, "users", userUid, "orders", orderId);
  await setDoc(orderRef, { status: "pago" }, { merge: true });
  console.log("Status do pedido atualizado para 'pago' no Firestore.");
 } catch (err) {
  console.error("Erro ao atualizar status no Firestore:", err);
 }
}

// 4. Enviar notificação para a planilha/email (script antigo)
async function sendNotification(formData) {
 if (!formData) return;

 try {
  const params = new URLSearchParams();
  params.append('tipo_formulario', 'checkout');

  for (const key of Object.keys(formData)) {
   params.append(key, formData[key]);
  }

  console.log("Enviando notificação para a planilha/email...");

  fetch(GOOGLE_SCRIPT_URL, {
   method: 'POST',
   mode: 'cors',
   cache: 'no-cache',
   headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
   redirect: 'follow',
   body: params.toString()
  }).then(() => console.log("Notificação enviada com sucesso!"))
    .catch(err => console.error("Erro ao enviar notificação:", err));

 } catch (err) {
  console.error("Exceção ao enviar notificação:", err);
 }
}

// 5. Verificar status do pagamento no PagBank (polling)
async function checkPaymentStatus(referenceId) {
 try {
  const params = new URLSearchParams();
  params.append('tipo_formulario', 'check_status');
  params.append('reference_id', referenceId);

  const response = await fetch(PAGBANK_SCRIPT_URL, {
   method: 'POST',
   mode: 'cors',
   cache: 'no-cache',
   headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
   redirect: 'follow',
   body: params.toString()
  });

  const text = await response.text();
  try {
   return JSON.parse(text);
  } catch {
   console.error("Resposta não-JSON do check_status:", text);
   return { status: "ERROR" };
  }
 } catch (err) {
  console.error("Erro ao verificar status:", err);
  return { status: "ERROR" };
 }
}

// 6. Polling loop — verifica a cada 5 segundos se o pagamento foi aprovado
async function startPaymentPolling(order) {
 const statusEl = document.getElementById('payment-status-text');
 const spinnerEl = document.getElementById('payment-status-spinner');
 const referenceId = order.reference_id;

 if (!referenceId) {
  console.warn("Sem reference_id para polling.");
  if (statusEl) statusEl.textContent = "Não foi possível verificar o pagamento automaticamente. Verifique em Meus Pedidos.";
  if (spinnerEl) spinnerEl.style.display = 'none';
  return;
 }

 let attempts = 0;
 const maxAttempts = 120; // 10 minutos (120 x 5s)

 const pollInterval = setInterval(async () => {
  attempts++;
  console.log(`Verificando pagamento... tentativa ${attempts}/${maxAttempts}`);

  const result = await checkPaymentStatus(referenceId);
  console.log("Resultado da API PagBank:", result);

  if (result.status === "PAID") {
   clearInterval(pollInterval);
   console.log("PAGAMENTO CONFIRMADO!");

   // Atualizar Firestore
   await updateOrderStatus(order.userUid, order.orderId);

   // Enviar notificação planilha/email
   await sendNotification(order.formData);

   // Atualizar UI
   if (statusEl) statusEl.textContent = "Pagamento aprovado!";
   if (spinnerEl) spinnerEl.style.display = 'none';
   
   const manualBtnContainer = document.getElementById('pagbank-manual-btn-container');
   if (manualBtnContainer) manualBtnContainer.style.display = 'none';

   // Mostrar overlay de aprovação
   showApprovalOverlay();

   // Limpar dados temporários
   localStorage.removeItem('pendingOrder');
  }

  if (attempts >= maxAttempts) {
   clearInterval(pollInterval);
   if (statusEl) statusEl.textContent = "Tempo esgotado. Verifique o status em Meus Pedidos.";
   if (spinnerEl) spinnerEl.style.display = 'none';
   localStorage.removeItem('pendingOrder');
  }
 }, 5000); // A cada 5 segundos
}

// 7. Process order and display confirmation
async function processSuccess() {
 const loadingEl = document.getElementById('success-loading');
 const contentEl = document.getElementById('success-content');
 const summaryCard = document.getElementById('order-summary-card');
 const itemsList = document.getElementById('success-items-list');
 const totalEl = document.getElementById('success-total');

 // Recuperar dados do pedido pendente
 const pendingOrderStr = localStorage.getItem('pendingOrder');

 // Limpar carrinho
 localStorage.setItem('cart', '[]');
 window.dispatchEvent(new Event('cart-updated'));

 // Aguardar um momento para efeito visual
 setTimeout(async () => {
  // Esconder loading, mostrar conteúdo
  if (loadingEl) loadingEl.style.display = 'none';
  if (contentEl) contentEl.style.display = 'block';

  // Se temos dados do pedido, mostrar o resumo
  if (pendingOrderStr && summaryCard && itemsList && totalEl) {
   try {
    const order = JSON.parse(pendingOrderStr);

    // Renderizar itens
    if (order.items && order.items.length > 0) {
     itemsList.innerHTML = order.items.map(item => `
      <div class="success-order-item">
       <span class="success-order-item-name">${item.qty}x ${item.name}</span>
       <span class="success-order-item-price">R$ ${(item.price * item.qty).toFixed(2).replace('.', ',')}</span>
      </div>
     `).join('');
    }

    // Mostrar total
    if (order.total) {
     totalEl.textContent = `R$ ${order.total.toFixed(2).replace('.', ',')}`;
    }

    summaryCard.style.display = 'block';
    
    // Configurar Botão Manual do PagBank caso o popup tenha falhado
    if (order.pay_url) {
     const manualBtnContainer = document.getElementById('pagbank-manual-btn-container');
     const manualLink = document.getElementById('pagbank-manual-link');
     if (manualBtnContainer && manualLink) {
      manualLink.href = order.pay_url;
      manualBtnContainer.style.display = 'block';
     }
    }

    // ── INICIAR POLLING DE PAGAMENTO ──
    startPaymentPolling(order);

   } catch (e) {
    console.error("Erro ao parsear pedido:", e);
   }
  }

  // Inicializar ícones
  if (window.lucide) {
   window.lucide.createIcons();
  }
 }, 1200);
}

// 8. Initializer
document.addEventListener('DOMContentLoaded', () => {
 processSuccess();

 if (window.lucide) {
  window.lucide.createIcons();
 }
});

// ============================================================================
// Nit Gifts — Success Page Controller (Retorno do PagBank)
// ============================================================================

import { auth, db, doc, getDoc, setDoc, onAuthStateChanged } from './firebase-config.js';

const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyUrmbaRzwqRku-QT7j_V1tqNMuheBB4zkNDJynJy7iV7bnF3FJ4JE6hgeZ2vTuN5bDfA/exec";

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

// 2. Atualizar status do pedido no Firestore para "pago"
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

// 3. Enviar notificação para a planilha/email (script antigo)
async function sendNotification(formData) {
 if (!formData) return;

 try {
  const params = new URLSearchParams();
  params.append('tipo_formulario', 'checkout');
  
  // Adicionar todos os campos do formulário
  for (const key of Object.keys(formData)) {
   params.append(key, formData[key]);
  }

  console.log("Enviando notificação para a planilha/email...");

  fetch(GOOGLE_SCRIPT_URL, {
   method: 'POST',
   mode: 'cors',
   cache: 'no-cache',
   headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
   },
   redirect: 'follow',
   body: params.toString()
  }).then(() => console.log("Notificação enviada com sucesso!"))
    .catch(err => console.error("Erro ao enviar notificação:", err));

 } catch (err) {
  console.error("Exceção ao enviar notificação:", err);
 }
}

// 4. Process order and display confirmation
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

 // Se temos dados do pedido, processar pagamento
 if (pendingOrderStr) {
  try {
   const order = JSON.parse(pendingOrderStr);

   // ── ATUALIZAR STATUS NO FIRESTORE ──
   await updateOrderStatus(order.userUid, order.orderId);

   // ── ENVIAR NOTIFICAÇÃO PARA PLANILHA/EMAIL ──
   await sendNotification(order.formData);

  } catch (err) {
   console.error("Erro ao processar pedido pós-pagamento:", err);
  }
 }

 // Aguardar um momento para efeito visual
 setTimeout(() => {
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
   } catch (e) {
    console.error("Erro ao parsear pedido:", e);
   }
  }

  // Limpar dados temporários do pedido
  localStorage.removeItem('pendingOrder');

  // Mostrar toast de sucesso
  showToast("Pagamento confirmado!", "Seu pedido foi registrado com sucesso.");

  // Inicializar ícones
  if (window.lucide) {
   window.lucide.createIcons();
  }
 }, 1200);
}

// 5. Initializer
document.addEventListener('DOMContentLoaded', () => {
 processSuccess();

 if (window.lucide) {
  window.lucide.createIcons();
 }
});

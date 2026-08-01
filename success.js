// ============================================================================
// Nit Gifts — Success Page Controller (Retorno do PagBank)
// ============================================================================

import { auth, db, doc, getDoc, onAuthStateChanged } from './firebase-config.js';

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

// 2. Process order and display confirmation
function processSuccess() {
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
  showToast("Pedido enviado!", "Aguardando confirmação de pagamento.");

  // Inicializar ícones
  if (window.lucide) {
   window.lucide.createIcons();
  }
 }, 1200);
}

// 3. Initializer
document.addEventListener('DOMContentLoaded', () => {
 processSuccess();

 if (window.lucide) {
  window.lucide.createIcons();
 }
});

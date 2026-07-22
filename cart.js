/* ==========================================================================
  Nit Gifts - Shopping Cart & Toast Alerts Controllers
  ========================================================================== */

// 1. Native Toast Notification System
function showToast(message) {
 const container = document.getElementById('toast-container');
 if (!container) return;

 // Create Toast Card Element
 const toastCard = document.createElement('div');
 toastCard.className = 'toast-card';

 // Render structure containing a Lucide ShoppingBag check or text
 toastCard.innerHTML = `
  <i data-lucide="shopping-bag" class="icon-sm" style="color: var(--color-accent);"></i>
  <span>${message}</span>
 `;

 container.appendChild(toastCard);

 // Parse dynamic icon inside toast
 if (window.lucide) {
  window.lucide.createIcons();
 }

 // Trigger visual slide-in
 setTimeout(() => {
  toastCard.classList.add('show');
 }, 10);

 // Trigger dismissal and cleanup after 3 seconds
 setTimeout(() => {
  toastCard.classList.remove('show');
  toastCard.classList.add('hide');

  // Wait for slide-out CSS transition before removing from DOM
  toastCard.addEventListener('transitionend', () => {
   toastCard.remove();
  });
 }, 3000);
}

// Export toast function globally for other pages to use if needed
window.showToast = showToast;

// 2. Shopping Cart Main Controller
function loadCart() {
 const cartData = JSON.parse(localStorage.getItem('cart') || '[]');
 const emptySection = document.getElementById('empty-cart-section');
 const activeSection = document.getElementById('active-cart-section');

 if (cartData.length === 0) {
  if (activeSection) activeSection.style.display = 'none';
  if (emptySection) {
   emptySection.style.display = 'block';
   setupDemoPopulator(); // Setup dev populate helper link
  }
  return;
 }

 if (emptySection) emptySection.style.display = 'none';
 if (activeSection) activeSection.style.display = 'block';

 // Render items list
 renderCartItems(cartData);

 // Recalculate and update summary prices
 updateOrderSummary(cartData);
}

// Developer Experience helper: Adds demo products to empty cart for instant local testing
function setupDemoPopulator() {
 const emptyBox = document.querySelector('.empty-cart-box');
 if (!emptyBox) return;

 let populatorLink = document.getElementById('demo-populate-link');
 if (!populatorLink) {
  populatorLink = document.createElement('button');
  populatorLink.id = 'demo-populate-link';
  populatorLink.style.cssText = `
   display: block; 
   margin: 24px auto 0 auto; 
   font-size: 12px; 
   color: var(--color-primary); 
   text-decoration: underline; 
   opacity: 0.7; 
   transition: opacity 0.2s ease;
  `;
  populatorLink.textContent = "Popular carrinho para testes (Demo)";
  populatorLink.addEventListener('mouseenter', () => populatorLink.style.opacity = '1');
  populatorLink.addEventListener('mouseleave', () => populatorLink.style.opacity = '0.7');

  populatorLink.addEventListener('click', () => {
   const demoItems = [
    {
     productId: "mol-1",
     name: "Moletom Premium Classic Black",
     price: 189.90,
     qty: 1,
     image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=600&auto=format&fit=crop",
     size: "GG",
     color: "Preto"
    },
    {
     productId: "can-1",
     name: "Caneca Cerâmica Terracota",
     price: 49.90,
     qty: 2,
     image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=600&auto=format&fit=crop",
     size: "Único",
     color: "Natural"
    }
   ];
   localStorage.setItem('cart', JSON.stringify(demoItems));
   window.dispatchEvent(new Event('cart-updated'));
   showToast("Carrinho populado com itens de teste!");
  });

  emptyBox.appendChild(populatorLink);
 }
}

// 3. Render Cart Item Cards List
function renderCartItems(cart) {
 const listContainer = document.getElementById('cart-items-list');
 if (!listContainer) return;

 listContainer.innerHTML = '';

 cart.forEach((item, i) => {
  const card = document.createElement('div');
  card.className = 'cart-item-card';
  card.style.animationDelay = `${i * 0.05}s`; // Stagger animation delay

  // Compiling parameters display
  let optionsHTML = '';
  if (item.size) {
   optionsHTML += `<span class="cart-item-option-badge">Tam: ${item.size}</span>`;
  }
  if (item.color) {
   optionsHTML += `<span class="cart-item-option-badge">Cor: ${item.color}</span>`;
  }

  card.innerHTML = `
   <a href="product.html?id=${item.productId}" class="cart-item-img-link">
    <img src="${item.image}" alt="${item.name}" class="cart-item-img">
   </a>
   <div class="cart-item-info">
    <div class="cart-item-header">
     <div>
      <h3 class="cart-item-name">${item.name}</h3>
      <div class="cart-item-options">
       ${optionsHTML}
      </div>
     </div>
     <button class="cart-item-remove-btn" data-index="${i}" aria-label="Remover item">
      <i data-lucide="trash-2" class="icon-sm"></i>
     </button>
    </div>
    <div class="cart-item-footer">
     <div class="quantity-selector">
      <button class="quantity-btn qty-decrease" data-index="${i}"><i data-lucide="minus" class="icon-sm" style="width:14px; height:14px;"></i></button>
      <span class="quantity-value">${item.qty}</span>
      <button class="quantity-btn qty-increase" data-index="${i}"><i data-lucide="plus" class="icon-sm" style="width:14px; height:14px;"></i></button>
     </div>
     <span class="cart-item-price">R$ ${(item.price * item.qty).toFixed(2).replace('.', ',')}</span>
    </div>
   </div>
  `;

  // Bind item remove listener
  card.querySelector('.cart-item-remove-btn').addEventListener('click', () => {
   removeItem(i);
  });

  // Bind quantity adjustments listeners
  card.querySelector('.qty-decrease').addEventListener('click', () => {
   updateQty(i, -1);
  });
  card.querySelector('.qty-increase').addEventListener('click', () => {
   updateQty(i, 1);
  });

  listContainer.appendChild(card);
 });

 // Render icons inside compiled cards list
 if (window.lucide) {
  window.lucide.createIcons();
 }
}

// 4. Cart Operations
function updateQty(index, delta) {
 const cart = JSON.parse(localStorage.getItem('cart') || '[]');
 if (!cart[index]) return;

 // Clamp quantity to at least 1 (Math.max equivalent)
 cart[index].qty = Math.max(1, cart[index].qty + delta);

 localStorage.setItem('cart', JSON.stringify(cart));
 window.dispatchEvent(new Event('cart-updated')); // Triggers re-rendering
}

function removeItem(index) {
 const cart = JSON.parse(localStorage.getItem('cart') || '[]');
 const updated = cart.filter((_, i) => i !== index);

 localStorage.setItem('cart', JSON.stringify(updated));
 window.dispatchEvent(new Event('cart-updated')); // Triggers re-rendering
 showToast("Item removido do carrinho");
}

// 5. Update Order Summary Calculations
function updateOrderSummary(cart) {
 const subtotalEl = document.getElementById('summary-subtotal');
 const shippingEl = document.getElementById('summary-shipping');
 const totalEl = document.getElementById('summary-total');
 const freeShippingAlert = document.getElementById('free-shipping-alert');

 const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
 const shipping = subtotal > 200 ? 0 : 19.90;
 const total = subtotal + shipping;

 // Update Subtotal UI
 if (subtotalEl) {
  subtotalEl.textContent = `R$ ${subtotal.toFixed(2).replace('.', ',')}`;
 }

 // Update Shipping UI (displays "Grátis" in green if 0)
 if (shippingEl) {
  if (shipping === 0) {
   shippingEl.innerHTML = `<span class="summary-value-free">Grátis</span>`;
  } else {
   shippingEl.textContent = `R$ ${shipping.toFixed(2).replace('.', ',')}`;
  }
 }

 // Toggle Free Shipping Reminder Alert
 if (freeShippingAlert) {
  if (subtotal < 200) {
   freeShippingAlert.style.display = 'block';
  } else {
   freeShippingAlert.style.display = 'none';
  }
 }

 // Update Grand Total UI
 if (totalEl) {
  totalEl.textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;
 }
}

// 6. Initializer Lifecycle
document.addEventListener('DOMContentLoaded', () => {
 // Sync changes automatically
 window.addEventListener('cart-updated', loadCart);

 // Initial load
 loadCart();

 // Initialize layout SVGs parsing
 if (window.lucide) {
  window.lucide.createIcons();
 }
});

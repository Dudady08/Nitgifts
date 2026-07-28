import { auth, db, doc, getDoc, setDoc, onAuthStateChanged, signOut, collection, getDocs, query, orderBy } from './firebase-config.js';

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

// 2. Format date helper
function formatDate(isoString) {
 try {
  const date = new Date(isoString);
  return date.toLocaleDateString('pt-BR', {
   day: '2-digit',
   month: 'long',
   year: 'numeric'
  });
 } catch {
  return 'Data não disponível';
 }
}

// 3. Format currency helper
function formatCurrency(value) {
 return `R$ ${Number(value).toFixed(2).replace('.', ',')}`;
}

// 4. Render Profile Data
function renderProfile(userData) {
 window.currentProfileData = userData || {};
 const nameEl = document.getElementById('profile-name');
 const emailEl = document.getElementById('profile-email');
 const phoneEl = document.getElementById('profile-phone');
 const sinceEl = document.getElementById('profile-since');
 const addressEl = document.getElementById('profile-address');

 if (nameEl) nameEl.textContent = userData.name || 'Não informado';
 if (emailEl) emailEl.textContent = userData.email || 'Não informado';
 if (phoneEl) phoneEl.textContent = userData.phone || 'Não informado';
 if (sinceEl) sinceEl.textContent = userData.createdAt ? formatDate(userData.createdAt) : 'Não disponível';

 if (addressEl && userData.address) {
  const addr = userData.address;
  const parts = [
   addr.street || '',
   addr.number ? `nº ${addr.number}` : '',
   addr.complement ? `(${addr.complement})` : '',
  ].filter(Boolean).join(', ');

  const cityLine = [
   addr.city || '',
   addr.state || ''
  ].filter(Boolean).join(' - ');

  const cepLine = addr.cep ? `CEP: ${addr.cep}` : '';

  addressEl.textContent = [parts, cityLine, cepLine].filter(Boolean).join(' · ');
 } else if (addressEl) {
  addressEl.textContent = 'Endereço não cadastrado';
 }
}

// 4.1 Inline Edit Logic
window.toggleEdit = function(field) {
 const container = document.getElementById(`field-${field}`);
 if (!container) return;

 const displayMode = container.querySelector('.display-mode');
 const editMode = container.querySelector('.edit-mode');
 const iconBtn = container.querySelector('.edit-icon-btn i');
 
 const isEditing = editMode.style.display === 'block';

 if (isEditing) {
  // Cancel edit
  editMode.style.display = 'none';
  displayMode.style.display = 'block';
  iconBtn.setAttribute('data-lucide', 'pencil');
  if (window.lucide) window.lucide.createIcons();
 } else {
  // Start edit
  displayMode.style.display = 'none';
  editMode.style.display = 'block';
  iconBtn.setAttribute('data-lucide', 'x');
  if (window.lucide) window.lucide.createIcons();

  const data = window.currentProfileData;
  if (field === 'name') document.getElementById('input-name').value = data.name || '';
  if (field === 'phone') document.getElementById('input-phone').value = data.phone || '';
  if (field === 'address') {
   const addr = data.address || {};
   document.getElementById('input-cep').value = addr.cep || '';
   document.getElementById('input-street').value = addr.street || '';
   document.getElementById('input-number').value = addr.number || '';
   document.getElementById('input-complement').value = addr.complement || '';
   document.getElementById('input-city').value = addr.city || '';
   document.getElementById('input-state').value = addr.state || '';
  }
 }
};

window.saveField = async function(field) {
 const user = auth.currentUser;
 if (!user) return;

 const container = document.getElementById(`field-${field}`);
 const btn = container.querySelector('button.btn');
 const originalBtnText = btn.textContent;
 btn.textContent = 'Salvando...';
 btn.disabled = true;

 let updates = {};
 if (field === 'name') updates = { name: document.getElementById('input-name').value };
 if (field === 'phone') updates = { phone: document.getElementById('input-phone').value };
 if (field === 'address') {
  updates = {
   address: {
    cep: document.getElementById('input-cep').value,
    street: document.getElementById('input-street').value,
    number: document.getElementById('input-number').value,
    complement: document.getElementById('input-complement').value,
    city: document.getElementById('input-city').value,
    state: document.getElementById('input-state').value
   }
  };
 }

 try {
  await setDoc(doc(db, "users", user.uid), updates, { merge: true });
  
  // Update local state and UI
  window.currentProfileData = { ...window.currentProfileData, ...updates };
  renderProfile(window.currentProfileData);
  window.toggleEdit(field);
  showToast("Sucesso", "Informação atualizada.");
 } catch (error) {
  console.error("Erro ao atualizar campo:", error);
  showToast("Erro", "Não foi possível salvar a alteração.");
 } finally {
  btn.textContent = originalBtnText;
  btn.disabled = false;
 }
};

// 5. Render Order Card
function createOrderCard(orderData) {
 const card = document.createElement('div');
 card.className = 'account-order-card';

 // Header
 const statusClass = (orderData.status || 'confirmado').toLowerCase();
 const statusLabel = {
  'confirmado': 'Confirmado',
  'enviado': 'Enviado',
  'entregue': 'Entregue'
 }[statusClass] || 'Confirmado';

 let headerHTML = `
  <div class="account-order-header">
   <span class="account-order-date">${formatDate(orderData.createdAt)}</span>
   <span class="account-order-status ${statusClass}">${statusLabel}</span>
  </div>
 `;

 // Items
 let itemsHTML = '<div class="account-order-items">';
 if (orderData.items && orderData.items.length > 0) {
  orderData.items.forEach(item => {
   const imgSrc = item.image || '';
   const imgTag = imgSrc
    ? `<img src="${imgSrc}" alt="${item.name}" class="account-order-item-img">`
    : `<div class="account-order-item-img" style="display:flex;align-items:center;justify-content:center;"><i data-lucide="package" style="width:20px;height:20px;color:rgba(26,26,26,0.2);"></i></div>`;

   itemsHTML += `
    <div class="account-order-item-row">
     ${imgTag}
     <div class="account-order-item-info">
      <p class="account-order-item-name">${item.name || 'Produto'}</p>
      <p class="account-order-item-qty">Qtd: ${item.qty || 1}</p>
     </div>
     <span class="account-order-item-price">${formatCurrency((item.price || 0) * (item.qty || 1))}</span>
    </div>
   `;
  });
 }
 itemsHTML += '</div>';

 // Footer
 const total = orderData.total || 0;
 let footerHTML = `
  <div class="account-order-footer">
   <span class="account-order-total-label">Total</span>
   <span class="account-order-total-value">${formatCurrency(total)}</span>
  </div>
 `;

 card.innerHTML = headerHTML + itemsHTML + footerHTML;
 return card;
}

// 6. Render Empty Orders State
function renderEmptyOrders() {
 const container = document.getElementById('orders-container');
 if (!container) return;

 container.innerHTML = `
  <div class="account-empty-orders">
   <i data-lucide="shopping-bag" style="width: 48px; height: 48px; stroke-width: 1;"></i>
   <h3 class="account-empty-orders-title">Nenhum pedido ainda</h3>
   <p class="account-empty-orders-text">Quando você fizer sua primeira compra, ela aparecerá aqui.</p>
   <a href="index.html" class="btn">Explorar Produtos</a>
  </div>
 `;
}

// 7. Load Orders from Firestore
async function loadOrders(uid) {
 const container = document.getElementById('orders-container');
 if (!container) return;

 try {
  const ordersRef = collection(db, "users", uid, "orders");
  const q = query(ordersRef, orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);

  if (snapshot.empty) {
   renderEmptyOrders();
   return;
  }

  container.innerHTML = '';
  const ordersList = document.createElement('div');
  ordersList.className = 'account-orders-list';

  snapshot.forEach(docSnap => {
   const orderData = docSnap.data();
   const card = createOrderCard(orderData);
   ordersList.appendChild(card);
  });

  container.appendChild(ordersList);
 } catch (error) {
  console.error("Erro ao carregar pedidos:", error);
  renderEmptyOrders();
 }
}

// 8. Logout Handler
function initLogout() {
 const logoutBtn = document.getElementById('logout-btn');
 if (logoutBtn) {
  logoutBtn.addEventListener('click', async () => {
   try {
    await signOut(auth);
    showToast("Até logo!", "Você saiu da sua conta.");
    setTimeout(() => {
     window.location.replace('login.html');
    }, 1000);
   } catch (error) {
    console.error("Erro no logout:", error);
    showToast("Erro", "Não foi possível sair. Tente novamente.");
   }
  });
 }
}

// 9. Firebase Auth State Listener
onAuthStateChanged(auth, async (user) => {
 const loadingEl = document.getElementById('account-loading');
 const contentEl = document.getElementById('account-content');

 if (!user) {
  window.location.replace('login.html');
  return;
 }

 // Load profile data from Firestore
 try {
  const userDoc = await getDoc(doc(db, "users", user.uid));

  if (userDoc.exists()) {
   renderProfile(userDoc.data());
  } else {
   // Fallback: use data from Firebase Auth
   renderProfile({
    name: user.displayName || 'Usuário',
    email: user.email || '',
    phone: '',
    address: null,
    createdAt: user.metadata?.creationTime || ''
   });
  }
 } catch (error) {
  console.error("Erro ao carregar perfil:", error);
  renderProfile({
   name: user.displayName || 'Usuário',
   email: user.email || '',
   phone: '',
   address: null,
   createdAt: ''
  });
 }

 // Load orders
 await loadOrders(user.uid);

 // Show content, hide skeleton
 if (loadingEl) loadingEl.style.display = 'none';
 if (contentEl) contentEl.style.display = 'block';

 // Re-render Lucide icons for dynamically generated content
 if (window.lucide) {
  window.lucide.createIcons();
 }
});

// 10. Initializer Lifecycle
document.addEventListener('DOMContentLoaded', () => {
 initLogout();
 if (window.lucide) {
  window.lucide.createIcons();
 }
});

import { auth, db, doc, getDoc, onAuthStateChanged, collection, addDoc, setDoc, getDocs, query, where } from './firebase-config.js';

const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyUrmbaRzwqRku-QT7j_V1tqNMuheBB4zkNDJynJy7iV7bnF3FJ4JE6hgeZ2vTuN5bDfA/exec";
const PAGBANK_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxwuC7xGX5YJX9u8DYxi0zm6hxKSF2GxevgkAtrkWscb1srBA3KIjvxy-NYZtWDfWJ8vQ/exec";
const CEP_ORIGEM = '24360220'; // CEP de envio da Nit Gifts
let userData = null;
let selectedShipping = null; // { nome, preco, prazo } — opção escolhida pelo cliente
let freteCalculado = false; // Flag: frete foi calculado com sucesso?

// Estado do Cupom
let appliedDiscount = 0;
let appliedCouponCode = '';
const COUPONS = {
 'TESTE1REAL': { type: 'fixed_price', value: 1.00 },
 'FRETEGRATIS': { type: 'free_shipping', value: 0 },
 'DESCONTO10': { type: 'percentage', value: 0.1, one_time: true },
 'DESCONTO10OM': { type: 'percentage', value: 0.1 }
};

// Perfil de embalagem por categoria (peso em gramas, dimensões em cm)
const CATEGORY_SHIPPING_PROFILE = {
 'canecas':    { weightG: 500, c: 15, l: 15, a: 15 },
 'placas-mdf': { weightG: 250, c: 23, l: 23, a: 3  },
 'gifts':      { weightG: 60,  c: 11, l: 11, a: 3  },
 'gifts-grande': { weightG: 120, c: 15, l: 15, a: 3 },
 'camisetas':  { weightG: 300, c: 25, l: 20, a: 4  },
 'default':    { weightG: 300, c: 20, l: 15, a: 10 }
};

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

// 2A. Calcular embalagem com base nos itens do carrinho
function calcularEmbalagem(cart) {
 let pesoTotalG = 0;
 let maxC = 0, maxL = 0;
 let alturaTotal = 0;

 cart.forEach(item => {
  const profile = CATEGORY_SHIPPING_PROFILE[item.category] || CATEGORY_SHIPPING_PROFILE['default'];
  const qty = item.qty || 1;

  pesoTotalG += profile.weightG * qty;
  // Footprint: maior entre todos os itens
  if (profile.c > maxC) maxC = profile.c;
  if (profile.l > maxL) maxL = profile.l;
  // Altura: empilhada por quantidade
  alturaTotal += profile.a * qty;
 });

 // Peso cúbico (gramas): C × L × A / 6 (equivalente a /6000 com medidas em cm e resultado em kg)
 const pesoCubicaG = (maxC * maxL * alturaTotal) / 6;
 const pesoFinalG  = Math.max(pesoTotalG, pesoCubicaG);

 // Correios exige mínimo de 15cm para comprimento e largura
 return {
  pesoG: Math.max(pesoFinalG, 100),
  c: Math.max(maxC, 15),
  l: Math.max(maxL, 10),
  a: Math.max(alturaTotal, 2)
 };
}

// 2B. Buscar frete no Correios via Google Apps Script
async function buscarFrete(cepDestino, embalagem) {
 const cepLimpo = cepDestino.replace(/\D/g, '');
 if (cepLimpo.length !== 8) return null;

 const params = new URLSearchParams({
  tipo_formulario: 'calcular_frete',
  cep_origem: CEP_ORIGEM,
  cep_destino: cepLimpo,
  peso_g: Math.ceil(embalagem.pesoG),
  comprimento: Math.ceil(embalagem.c),
  largura: Math.ceil(embalagem.l),
  altura: Math.ceil(embalagem.a)
 });

 try {
  const resp = await fetch(PAGBANK_SCRIPT_URL, {
   method: 'POST',
   body: params // Isso envia como application/x-www-form-urlencoded
  });
  const text = await resp.text();
  try {
   const data = JSON.parse(text);
   if (data.success && data.opcoes && data.opcoes.length > 0) {
    return data.opcoes;
   }
   // Log para debug (sem alert intrusivo)
   console.warn('Frete API retornou erro:', data);
   return null;
  } catch(e) {
   console.warn('Frete API retornou resposta não-JSON:', text.substring(0, 200));
   return null;
  }
 } catch (err) {
  console.error('Erro de rede ao buscar frete:', err);
  return null;
 }
}

// Função para recalcular o total considerando frete e cupom
function atualizarTotalGeral() {
 const cart = JSON.parse(localStorage.getItem('cart') || '[]');
 const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
 const shipping = selectedShipping ? selectedShipping.preco : 0;
 
 let total = subtotal + shipping;
 let discount = 0;

  if (appliedCouponCode && COUPONS[appliedCouponCode]) {
    const coupon = COUPONS[appliedCouponCode];
    if (coupon.type === 'fixed_price') {
      discount = total - coupon.value;
      if (discount < 0) discount = 0;
    } else if (coupon.type === 'percentage') {
      discount = subtotal * coupon.value;
    } else if (coupon.type === 'free_shipping') {
      discount = shipping;
    }
  }
 appliedDiscount = discount;
 total = total - discount;

 const totalEl = document.getElementById('summary-total');
 if (totalEl) totalEl.textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;

 const discountRow = document.getElementById('discount-row');
 const discountValue = document.getElementById('summary-discount');
 if (discount > 0 && discountRow && discountValue) {
   discountRow.style.display = 'flex';
   discountValue.textContent = `- R$ ${discount.toFixed(2).replace('.', ',')}`;
 } else if (discountRow) {
   discountRow.style.display = 'none';
 }
}

// 2C. Renderizar seletor PAC/SEDEX e atualizar total
function renderizarSeletorFrete(opcoes, subtotal) {
  // Aplicar regra de Frete Grátis para compras >= 300
  if (subtotal >= 300) {
   opcoes = [{
    codigo: "frete_gratis",
    nome: "Frete Grátis Especial",
    prazo: opcoes && opcoes[0] ? opcoes[0].prazo : "5 a 10 dias úteis",
    preco: 0
   }];
  }

 const loadingEl  = document.getElementById('shipping-loading');
 const optionsEl  = document.getElementById('shipping-options');
 const submitBtn  = document.getElementById('submit-order-btn');

 if (loadingEl) loadingEl.style.display = 'none';
 if (!optionsEl) return;

 optionsEl.innerHTML = '';
 optionsEl.style.display = 'block';

 // Selecionar o mais barato por padrão
 selectedShipping = opcoes[0];
 freteCalculado = true;

 // Habilitar botão de pagamento agora que o frete foi calculado
 if (submitBtn) {
  submitBtn.disabled = false;
  submitBtn.style.opacity = '1';
  submitBtn.style.cursor = 'pointer';
 }

 opcoes.forEach((opcao, idx) => {
  const isSelected = idx === 0;
  const optEl = document.createElement('label');
  optEl.className = 'shipping-option' + (isSelected ? ' selected' : '');
  optEl.innerHTML = `
   <input type="radio" name="shipping_option" value="${idx}" ${isSelected ? 'checked' : ''} style="display:none">
   <div class="shipping-option-info">
    <span class="shipping-option-name">${opcao.nome}</span>
    <span class="shipping-option-prazo">${opcao.prazo}</span>
   </div>
   <span class="shipping-option-price">R$ ${opcao.preco.toFixed(2).replace('.', ',')}</span>
  `;

  optEl.addEventListener('click', () => {
   document.querySelectorAll('.shipping-option').forEach(el => el.classList.remove('selected'));
   optEl.classList.add('selected');
   optEl.querySelector('input').checked = true;
   selectedShipping = opcao;
   atualizarTotalGeral();
  });

  optionsEl.appendChild(optEl);
 });

 atualizarTotalGeral();
}

// 2D. Render Checkout Summary Content
function loadCheckoutSummary() {
 const cart = JSON.parse(localStorage.getItem('cart') || '[]');
 const listContainer = document.getElementById('checkout-items-list');
 const subtotalEl = document.getElementById('summary-subtotal');

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

 const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
 if (subtotalEl) subtotalEl.textContent = `R$ ${subtotal.toFixed(2).replace('.', ',')}`;

 // Mostrar frete e total provisionalmente IMEDIATAMENTE (o frete real atualiza depois)
 const loadingEl = document.getElementById('shipping-loading');
 const optionsEl = document.getElementById('shipping-options');

 if (loadingEl) loadingEl.style.display = 'none';
 if (optionsEl) {
  optionsEl.style.display = 'flex';
  optionsEl.innerHTML = `
   <div class="shipping-option selected" style="cursor:default; border-color: rgba(26,26,26,0.1); background: transparent;">
    <div class="shipping-option-info">
     <span class="shipping-option-name" style="color: rgba(26,26,26,0.6);">Frete</span>
     <span class="shipping-option-prazo" style="color: rgba(26,26,26,0.5);">Buscando opções...</span>
    </div>
    <span class="shipping-option-price" style="color: rgba(26,26,26,0.5);">Calculando...</span>
   </div>
  `;
 }
 atualizarTotalGeral();
}

function initCouponSystem() {
  const applyBtn = document.getElementById('apply-coupon-btn');
  const input = document.getElementById('coupon-input');
  const msg = document.getElementById('coupon-message');

  if (!applyBtn || !input) return;

  applyBtn.addEventListener('click', async () => {
    const code = input.value.trim().toUpperCase();
    if (!code) return;

    if (COUPONS[code]) {
      // ── VALIDAÇÃO DE CUPOM DE USO ÚNICO ──
      if (COUPONS[code].one_time) {
        if (!auth.currentUser) {
          msg.textContent = 'Você precisa estar logado para usar este cupom especial.';
          msg.className = 'coupon-message error';
          msg.style.display = 'block';
          return;
        }
        
        applyBtn.textContent = "Validando...";
        applyBtn.disabled = true;
        
        try {
          const ordersRef = collection(db, "users", auth.currentUser.uid, "orders");
          const q = query(ordersRef, where("couponCode", "==", code));
          const querySnapshot = await getDocs(q);
          
          if (!querySnapshot.empty) {
            msg.textContent = 'Você já utilizou este cupom em uma compra anterior!';
            msg.className = 'coupon-message error';
            msg.style.display = 'block';
            applyBtn.textContent = "Aplicar";
            applyBtn.disabled = false;
            return;
          }
        } catch (error) {
          console.error("Erro ao validar cupom:", error);
          msg.textContent = 'Erro ao validar o cupom. Tente novamente.';
          msg.className = 'coupon-message error';
          msg.style.display = 'block';
          applyBtn.textContent = "Aplicar";
          applyBtn.disabled = false;
          return;
        }
        
        applyBtn.textContent = "Aplicar";
        applyBtn.disabled = false;
      }
      
      appliedCouponCode = code;
      msg.textContent = 'Cupom aplicado com sucesso!';
      msg.className = 'coupon-message success';
      msg.style.display = 'block';
      atualizarTotalGeral();
    } else {
      msg.textContent = 'Cupom inválido ou expirado.';
      msg.className = 'coupon-message error';
      msg.style.display = 'block';
      
      // Se tinha um cupom antes e errou o novo, removemos
      if (appliedCouponCode) {
        appliedCouponCode = '';
        atualizarTotalGeral();
      }
    }
  });
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

  if (!freteCalculado) {
   showToast("Frete pendente", "Aguarde o cálculo do frete ou tente novamente.");
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

  // Usar o frete selecionado pelo cliente; fallback para R$19,90 caso não tenha carregado
  const shipping = selectedShipping ? selectedShipping.preco : 19.90;
  
  let finalTotal = subtotal + shipping;
  let discount = 0;
  if (appliedCouponCode && COUPONS[appliedCouponCode]) {
    const coupon = COUPONS[appliedCouponCode];
    if (coupon.type === 'fixed_price') {
      discount = finalTotal - coupon.value;
      if (discount < 0) discount = 0;
    } else if (coupon.type === 'percentage') {
      discount = subtotal * coupon.value;
    } else if (coupon.type === 'free_shipping') {
      discount = shipping;
    }
  }
  finalTotal -= discount;

  const formattedTotal = `R$ ${finalTotal.toFixed(2).replace('.', ',')}`;
  const shippingLabel = selectedShipping ? selectedShipping.nome : 'Frete';
  const formattedShipping = `R$ ${shipping.toFixed(2).replace('.', ',')}`;

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
     discount: discount,
     couponCode: appliedCouponCode || null,
     total: finalTotal,
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
   let itemsForPagBank = cart.map(item => ({
    name: item.name,
    qty: item.qty,
    price: item.price
   }));

   // ── CUPOM: Se há desconto, substituir tudo por 1 item de R$1,00 ──
   let finalDiscountForPagBank = discount;
   if (discount > 0 && COUPONS[appliedCouponCode] && COUPONS[appliedCouponCode].type === 'fixed_price') {
    itemsForPagBank = [{
     name: 'Pedido NitGifts (cupom ' + appliedCouponCode + ')',
     qty: 1,
     price: COUPONS[appliedCouponCode].value
    }];
    finalDiscountForPagBank = 0; // Já reduzimos o item, não podemos enviar desconto
   }

   // Adicionar o Frete como um item extra no PagBank (se não for grátis e não tiver cupom fixed_price)
   if (shipping > 0 && !(discount > 0 && COUPONS[appliedCouponCode] && COUPONS[appliedCouponCode].type === 'fixed_price')) {
     itemsForPagBank.push({
      name: shippingLabel + " - " + (selectedShipping ? selectedShipping.prazo : 'A calcular'),
      qty: 1,
      price: shipping
     });
    }

   pagbankData.append('items', JSON.stringify(itemsForPagBank));
   
   // ALERT PARA DEBUG (Vamos descobrir o que está acontecendo)
   if (discount > 0) {
     alert("DEBUG DO CUPOM!\n\nItens que estão sendo enviados para o PagBank:\n" + JSON.stringify(itemsForPagBank, null, 2) + "\n\nDesconto enviado: R$ " + finalDiscountForPagBank);
   }
   
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
   pagbankData.append('tipo_frete', shippingLabel + (selectedShipping ? ' (' + selectedShipping.prazo + ')' : ''));
   pagbankData.append('desconto', finalDiscountForPagBank.toString());
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
    showToast("Erro inesperado", "O servidor retornou uma resposta inválida.");
    return;
   }

   if (result.success) {
    // ALERT COM OS LOGS DO PAGBANK PARA ENVIAR POR EMAIL
    if (result.pagbank_log) {
       alert("🎉 TESTE CONCLUÍDO!\n\nCopie o texto abaixo e envie para o PagBank:\n\n" + JSON.stringify(result.pagbank_log, null, 2));
    }
    
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

    // Detectar erro de homologação PagBank e exibir mensagem clara
    if (errorMsg.toLowerCase().includes('allowlist') || errorMsg.toLowerCase().includes('whitelist')) {
     showToast("PagBank em configuração", "O sistema de pagamento está sendo configurado. Tente novamente em breve ou entre em contato pelo WhatsApp.");
    } else {
     showToast("Erro no pagamento", errorMsg);
    }

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

async function loadUserAddress(user) {
 try {
  const userDoc = await getDoc(doc(db, "users", user.uid));
  if (userDoc.exists() && userDoc.data().address) {
   userData = userDoc.data();

   const skeleton = document.getElementById('user-address-skeleton');
   const container = document.getElementById('user-address-container');

   if (skeleton) skeleton.style.display = 'none';
   if (container) container.style.display = 'block';

   const nameEl   = document.getElementById('display-name');
   const streetEl = document.getElementById('display-street');
   const cityEl   = document.getElementById('display-city');
   const phoneEl  = document.getElementById('display-phone');

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

   // ── Calcular frete real com CEP do perfil ──
   const cep = userData.address.cep;
   const cart = JSON.parse(localStorage.getItem('cart') || '[]');
   const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

   if (cep && cart.length > 0) {
    const embalagem = calcularEmbalagem(cart);
    const opcoes = await buscarFrete(cep, embalagem);
    if (opcoes && opcoes.length > 0) {
     renderizarSeletorFrete(opcoes, subtotal);
    } else {
     // Frete não conseguiu ser calculado — mostrar erro com botão de retry
     selectedShipping = null;
     freteCalculado = false;
     renderizarFreteErro(subtotal, cep, embalagem);
    }
   } else {
    selectedShipping = null;
    freteCalculado = false;
    renderizarFreteSemCep(subtotal);
   }

  } else {
   window.location.replace('complete-profile.html');
  }
 } catch (error) {
  console.error("Erro ao buscar endereço:", error);
  showAddressError("Erro ao carregar seus dados. Verifique sua conexão.");
 }
}

// Fallback visual — erro ao calcular frete (com botão de retry)
function renderizarFreteErro(subtotal, cep, embalagem) {
 // Se compra >= 300, aplicar frete grátis diretamente sem precisar do GAS
 if (subtotal >= 300) {
  renderizarSeletorFrete([{ codigo: 'frete_gratis', nome: 'Frete Grátis Especial', prazo: '5 a 10 dias úteis', preco: 0 }], subtotal);
  return;
 }

 const loadingEl = document.getElementById('shipping-loading');
 const optionsEl = document.getElementById('shipping-options');
 const totalEl   = document.getElementById('summary-total');
 const submitBtn = document.getElementById('submit-order-btn');

 if (loadingEl) loadingEl.style.display = 'none';

 // Bloquear botão de pagamento
 if (submitBtn) {
  submitBtn.disabled = true;
  submitBtn.style.opacity = '0.5';
  submitBtn.style.cursor = 'not-allowed';
 }

 if (optionsEl) {
  optionsEl.style.display = 'block';
  optionsEl.innerHTML = `
   <div style="padding: 16px; border: 1px solid rgba(200,50,50,0.2); border-radius: 10px; background: rgba(200,50,50,0.04); text-align: center;">
    <p style="font-size: 13px; color: #c0392b; font-weight: 600; margin-bottom: 4px;">Não foi possível calcular o frete</p>
    <p style="font-size: 12px; color: rgba(26,26,26,0.5); margin-bottom: 12px;">O serviço dos Correios está indisponível. Tente novamente.</p>
    <button id="retry-frete-btn" style="padding: 8px 20px; font-size: 13px; font-weight: 600; border: 1px solid var(--color-primary); color: var(--color-primary); background: transparent; border-radius: 8px; cursor: pointer; transition: all 0.2s ease;">
     Tentar novamente
    </button>
   </div>
  `;
  // Bind retry
  const retryBtn = document.getElementById('retry-frete-btn');
  if (retryBtn) {
   retryBtn.addEventListener('click', async () => {
    retryBtn.textContent = 'Calculando...';
    retryBtn.disabled = true;
    const opcoes = await buscarFrete(cep, embalagem);
    if (opcoes && opcoes.length > 0) {
     renderizarSeletorFrete(opcoes, subtotal);
    } else {
     retryBtn.textContent = 'Tentar novamente';
     retryBtn.disabled = false;
     showToast('Frete indisponível', 'O serviço de cálculo de frete está fora do ar. Tente novamente em instantes.');
    }
   });
  }
 }
 if (totalEl) {
  totalEl.textContent = `R$ ${subtotal.toFixed(2).replace('.', ',')} + frete`;
 }
}

// Fallback visual — sem CEP no perfil
function renderizarFreteSemCep(subtotal) {
 // Se compra >= 300, aplicar frete grátis mesmo sem CEP
 if (subtotal >= 300) {
  renderizarSeletorFrete([{ codigo: 'frete_gratis', nome: 'Frete Grátis Especial', prazo: '5 a 10 dias úteis', preco: 0 }], subtotal);
  return;
 }

 const loadingEl = document.getElementById('shipping-loading');
 const optionsEl = document.getElementById('shipping-options');
 const totalEl   = document.getElementById('summary-total');
 const submitBtn = document.getElementById('submit-order-btn');

 if (loadingEl) loadingEl.style.display = 'none';

 // Bloquear botão de pagamento
 if (submitBtn) {
  submitBtn.disabled = true;
  submitBtn.style.opacity = '0.5';
  submitBtn.style.cursor = 'not-allowed';
 }

 if (optionsEl) {
  optionsEl.style.display = 'block';
  optionsEl.innerHTML = `
   <div style="padding: 16px; border: 1px solid rgba(200,150,50,0.3); border-radius: 10px; background: rgba(200,150,50,0.05); text-align: center;">
    <p style="font-size: 13px; color: #b7791f; font-weight: 600; margin-bottom: 4px;">CEP não cadastrado</p>
    <p style="font-size: 12px; color: rgba(26,26,26,0.5);">Complete seu endereço em <a href="account.html" style="color: var(--color-primary); text-decoration: underline;">Minha Conta</a> para calcular o frete.</p>
   </div>
  `;
 }
 if (totalEl) {
  totalEl.textContent = `R$ ${subtotal.toFixed(2).replace('.', ',')} + frete`;
 }
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
 initCouponSystem();

 // Bloquear botão de pagamento inicialmente (habilita quando frete é calculado)
 const submitBtn = document.getElementById('submit-order-btn');
 if (submitBtn) {
  submitBtn.disabled = true;
  submitBtn.style.opacity = '0.5';
  submitBtn.style.cursor = 'not-allowed';
 }

 if (window.lucide) {
  window.lucide.createIcons();
 }
});

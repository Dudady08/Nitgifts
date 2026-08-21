/* ==========================================================================
  Nit Gifts - Product Details Controller
  ========================================================================== */



// 2. Apparel Measurement details mapping
const sizeChart = {
 camisetas: {
  headers: ["Modelo", "Largura", "Comprimento", "Manga"],
  rows: [["P", "48cm", "68cm", "19cm"], ["M", "52cm", "72cm", "20cm"], ["G", "56cm", "74cm", "21cm"], ["GG", "60cm", "76cm", "22cm"]]
 },
 moletons: {
  headers: ["Modelo", "Largura", "Comprimento", "Manga"],
  rows: [["P", "54cm", "70cm", "60cm"], ["M", "58cm", "73cm", "62cm"], ["G", "62cm", "76cm", "64cm"], ["GG", "66cm", "78cm", "66cm"]]
 },
};

// 3. Dynamic Toast Notification System
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

// 4. Product Loader & Content Compiler
let selectedImageIdx = 0;
let selectedSize = "";
let selectedColor = "";
let selectedVariant = null;
let qty = 1;
let showSizeChart = false;

function loadProductDetail() {
 // Extract id from query params (?id=ID)
 const params = new URLSearchParams(window.location.search);
 const productId = params.get('id');

 const skeleton = document.getElementById('detail-skeleton-loader');
 const errorState = document.getElementById('detail-error-state');
 const content = document.getElementById('detail-product-content');

 // Find product by id or aliases
 const product = mockProducts.find(p => p.id === productId || p.aliases.includes(productId));

 // Loading timing mimic (800ms skeleton)
 setTimeout(() => {
  if (skeleton) skeleton.style.display = 'none';

  if (!product) {
   if (errorState) errorState.style.display = 'block';
   document.title = "Nit Gifts | Produto não encontrado";
   return;
  }

  if (content) content.style.display = 'block';

  // Set page title
  document.title = `Nit Gifts | ${product.name}`;

  // Category back link text and href mapping
  const backLink = document.getElementById('detail-back-link');
  const backText = document.getElementById('detail-back-text');
  const displayCategory = product.category === 'placas-mdf'
   ? 'Placas MDF'
   : product.category.charAt(0).toUpperCase() + product.category.slice(1);

  if (backLink) {
   backLink.href = `category.html?c=${product.category}`;
  }
  if (backText) {
   backText.textContent = `Voltar para ${displayCategory}`;
  }

  // Set dynamic info
  const labelCategory = document.getElementById('detail-category-label');
  const nameHeading = document.getElementById('detail-product-name');
  const descPara = document.getElementById('detail-description');
  const currentPriceEl = document.getElementById('detail-current-price');
  const originalPriceEl = document.getElementById('detail-original-price');
  const limitedBadge = document.getElementById('detail-limited-badge');

  if (labelCategory) labelCategory.textContent = displayCategory;
  if (nameHeading) nameHeading.textContent = product.name;
  if (descPara) descPara.textContent = product.description || "Descrição em desenvolvimento para este modelo exclusivo da Nitgift.";
  if (currentPriceEl) currentPriceEl.textContent = `R$ ${product.price.toFixed(2).replace('.', ',')}`;

  // Setup SKU
  const skuEl = document.getElementById('detail-sku');
  if (skuEl) {
   const code = (product.aliases && product.aliases.length > 0) ? product.aliases[0] : product.id;
   skuEl.textContent = `REF: ${code.toUpperCase()}`;
  }

  if (originalPriceEl) {
   if (product.original_price && product.original_price > product.price) {
    originalPriceEl.textContent = `R$ ${product.original_price.toFixed(2).replace('.', ',')}`;
    originalPriceEl.style.display = 'inline';
   } else {
    originalPriceEl.style.display = 'none';
   }
  }

  if (limitedBadge) {
   limitedBadge.style.display = product.is_limited_edition ? 'inline-block' : 'none';
  }

  // Setup Gallery
  const mainImg = document.getElementById('detail-main-img');
  const thumbsContainer = document.getElementById('detail-thumbs-list');
  const images = [product.image_url, ...(product.gallery_urls || [])].filter(Boolean);

  if (mainImg) {
   mainImg.src = images[0];
   mainImg.alt = product.name;
  }

  if (thumbsContainer) {
   thumbsContainer.innerHTML = '';
   if (images.length > 1) {
    images.forEach((imgSrc, i) => {
     const btn = document.createElement('button');
     btn.className = `product-thumb-btn ${i === 0 ? 'active' : ''}`;
     btn.innerHTML = `<img src="${imgSrc}" alt="">`;
     btn.addEventListener('click', () => {
      selectedImageIdx = i;
      if (mainImg) mainImg.src = imgSrc;
      // Highlight active thumb
      thumbsContainer.querySelectorAll('.product-thumb-btn').forEach((b, idx) => {
       b.classList.toggle('active', idx === i);
      });
     });
     thumbsContainer.appendChild(btn);
    });
   }
  }

  // Setup Colors Selector
  const colorsSection = document.getElementById('detail-colors-section');
  const colorsList = document.getElementById('detail-colors-list');
  const colorSpan = document.getElementById('selected-color-span');

  let productColors = product.colors;
  if (product.category === 'gifts' || product.category === 'placas-mdf') {
   productColors = [];
  }

  if (productColors && productColors.length > 0) {
   if (colorsSection) colorsSection.style.display = 'block';
   if (colorSpan) colorSpan.textContent = productColors[0];
   selectedColor = productColors[0];

   if (colorsList) {
    colorsList.innerHTML = '';
    productColors.forEach((col, i) => {
     const btn = document.createElement('button');
     btn.className = `variant-btn ${i === 0 ? 'active' : ''}`;
     btn.textContent = col;
     btn.addEventListener('click', () => {
      selectedColor = col;
      if (colorSpan) colorSpan.textContent = col;
      colorsList.querySelectorAll('.variant-btn').forEach((b) => {
       b.classList.toggle('active', b.textContent === col);
      });
     });
     colorsList.appendChild(btn);
    });
   }
  } else {
   if (colorsSection) colorsSection.style.display = 'none';
   selectedColor = "";
  }

  // Setup Sizes Selector
  const sizesSection = document.getElementById('detail-sizes-section');
  const sizesList = document.getElementById('detail-sizes-list');
  const sizeSpan = document.getElementById('selected-size-span');
  const sizeChartBtn = document.getElementById('size-chart-toggle-btn');
  const sizeChartCard = document.getElementById('detail-size-chart-card');
  const hasChart = sizeChart[product.category];

  if (product.sizes && product.sizes.length > 0) {
   if (sizesSection) sizesSection.style.display = 'block';
   if (sizeSpan) sizeSpan.textContent = product.sizes[0];
   selectedSize = product.sizes[0];

   if (sizesList) {
    sizesList.innerHTML = '';
    product.sizes.forEach((sz, i) => {
     const btn = document.createElement('button');
     btn.className = `variant-btn size-btn ${i === 0 ? 'active' : ''}`;
     btn.textContent = sz;
     btn.addEventListener('click', () => {
      selectedSize = sz;
      if (sizeSpan) sizeSpan.textContent = sz;
      sizesList.querySelectorAll('.variant-btn').forEach((b) => {
       b.classList.toggle('active', b.textContent === sz);
      });
     });
     sizesList.appendChild(btn);
    });
   }

   // Hide or show ruler size table link
   if (sizeChartBtn) {
    sizeChartBtn.style.display = hasChart ? 'inline-flex' : 'none';
   }

   // Handle measurements dynamic data render
   if (hasChart && sizeChartCard) {
    const tableHeaders = document.getElementById('size-chart-headers');
    const tableRows = document.getElementById('size-chart-rows');

    if (tableHeaders && tableRows) {
     tableHeaders.innerHTML = sizeChart[product.category].headers.map(h =>
      `<th class="text-left py-1.5 font-bold uppercase tracking-wider">${h}</th>`
     ).join('');

     tableRows.innerHTML = sizeChart[product.category].rows.map(row =>
      `<tr class="border-t border-border">
        ${row.map((cell, j) => `<td class="py-2 ${j === 0 ? 'size-name' : ''}">${cell}</td>`).join('')}
       </tr>`
     ).join('');
    }
   }
  } else {
   if (sizesSection) sizesSection.style.display = 'none';
   selectedSize = "";
  }

  // Toggle measurements drawer
  if (sizeChartBtn && sizeChartCard) {
   // Clear previous binding and add new one
   sizeChartBtn.replaceWith(sizeChartBtn.cloneNode(true));
   const newChartBtn = document.getElementById('size-chart-toggle-btn');
   newChartBtn.addEventListener('click', () => {
    showSizeChart = !showSizeChart;
    sizeChartCard.style.display = showSizeChart ? 'block' : 'none';
   });
  }

  // Setup Gifts Variant Picker
  const variantsSection = document.getElementById('detail-variants-section');
  const variantsList = document.getElementById('detail-variants-list');
  const variantSpan = document.getElementById('selected-variant-span');

  if (product.variants && product.variants.length > 0) {
   if (variantsSection) variantsSection.style.display = 'block';
   selectedVariant = product.variants[0];
   if (variantSpan) variantSpan.textContent = selectedVariant.name;

   if (variantsList) {
    variantsList.innerHTML = '';
    product.variants.forEach((vrnt, i) => {
     const btn = document.createElement('button');
     btn.className = `variant-option-btn ${i === 0 ? 'active' : ''}`;
     btn.innerHTML = `
      <img src="${vrnt.image_url}" class="variant-option-img" alt="${vrnt.name}">
      <span class="variant-option-name">${vrnt.name}</span>
     `;
     btn.addEventListener('click', () => {
      selectedVariant = vrnt;
      if (variantSpan) variantSpan.textContent = vrnt.name;
      
      // Update main image
      if (mainImg) mainImg.src = vrnt.image_url;

      variantsList.querySelectorAll('.variant-option-btn').forEach((b) => {
       b.classList.remove('active');
      });
      btn.classList.add('active');
     });
     variantsList.appendChild(btn);
    });
   }
  } else {
   if (variantsSection) variantsSection.style.display = 'none';
   selectedVariant = null;
  }

  // Setup Customization CTA
  const customizationSection = document.getElementById('detail-customization-section');
  const customizationBtn = document.getElementById('customization-whatsapp-btn');
  if (product.product_type === 'personalizado') {
   if (customizationSection) customizationSection.style.display = 'block';
   if (customizationBtn) {
    customizationBtn.href = `https://wa.me/5511974962380?text=Olá! Quero personalizar o produto: ${encodeURIComponent(product.name)}`;
   }
  } else {
   if (customizationSection) customizationSection.style.display = 'none';
  }

  // Setup Materials Grid Details
  const specMaterialItem = document.getElementById('spec-material-item');
  const specMaterialVal = document.getElementById('spec-material-val');
  const specWeightItem = document.getElementById('spec-weight-item');
  const specWeightVal = document.getElementById('spec-weight-val');
  const specDimensionsItem = document.getElementById('spec-dimensions-item');
  const specDimensionsVal = document.getElementById('spec-dimensions-val');

  if (product.material && specMaterialItem && specMaterialVal) {
   specMaterialVal.textContent = product.material;
   specMaterialItem.style.display = 'flex';
  } else if (specMaterialItem) {
   specMaterialItem.style.display = 'none';
  }

  if (product.weight_gsm && specWeightItem && specWeightVal) {
   specWeightVal.textContent = `${product.weight_gsm} GSM`;
   specWeightItem.style.display = 'flex';
  } else if (specWeightItem) {
   specWeightItem.style.display = 'none';
  }

  if (product.dimensions && specDimensionsItem && specDimensionsVal) {
   specDimensionsVal.textContent = product.dimensions;
   specDimensionsItem.style.display = 'flex';
  } else if (specDimensionsItem) {
   specDimensionsItem.style.display = 'none';
  }

  // Initialize/Bind click quantity controls
  initQuantityControls(product);

  // Render Lucide newly added markup tags
  if (window.lucide) {
   window.lucide.createIcons();
  }
 }, 800);
}

// 5. Quantity counter and Add to Cart pipeline binding
function initQuantityControls(product) {
 const qtyMinus = document.getElementById('qty-minus');
 const qtyPlus = document.getElementById('qty-plus');
 const qtyVal = document.getElementById('qty-val');
 const addToCartBtn = document.getElementById('add-to-cart-btn');

 qty = 1;
 if (qtyVal) qtyVal.textContent = '1';

 if (qtyMinus && qtyVal) {
  qtyMinus.replaceWith(qtyMinus.cloneNode(true));
  const newMinus = document.getElementById('qty-minus');
  newMinus.addEventListener('click', () => {
   qty = Math.max(1, qty - 1);
   qtyVal.textContent = qty;
  });
 }

 if (qtyPlus && qtyVal) {
  qtyPlus.replaceWith(qtyPlus.cloneNode(true));
  const newPlus = document.getElementById('qty-plus');
  newPlus.addEventListener('click', () => {
   qty += 1;
   qtyVal.textContent = qty;
  });
 }

 // 6. LocalStorage Add to Cart Action
 if (addToCartBtn) {
  addToCartBtn.replaceWith(addToCartBtn.cloneNode(true));
  const newCartBtn = document.getElementById('add-to-cart-btn');
  newCartBtn.addEventListener('click', () => {
   const cart = JSON.parse(localStorage.getItem('cart') || '[]');

   // Determine exact name and image based on variants
   const itemName = selectedVariant ? `${product.name} - ${selectedVariant.name}` : product.name;
   const itemImage = selectedVariant ? selectedVariant.image_url : product.image_url;
   // For variants, we include the variant name in color/size field or productId string so cart can group properly
   const cartProductId = selectedVariant ? `${product.id}-${selectedVariant.name}` : product.id;

   const item = {
    productId: cartProductId,
    name: itemName,
    price: product.price,
    image: itemImage,
    size: selectedSize,
    color: selectedColor,
    qty: qty
   };

   // Check if product with identical selection variables already exists in basket
   const existingIdx = cart.findIndex(c =>
    c.productId === cartProductId &&
    c.size === selectedSize &&
    c.color === selectedColor
   );

   if (existingIdx >= 0) {
    cart[existingIdx].qty += qty;
   } else {
    cart.push(item);
   }

   localStorage.setItem('cart', JSON.stringify(cart));
   window.dispatchEvent(new Event('cart-updated'));

   // Trigger Toast notification feedback
   showToast("Adicionado ao carrinho!", `${product.name} × ${qty}`);
  });
 }
}

// Initializer Lifecycle
document.addEventListener('DOMContentLoaded', () => {
 // Parse and compile dynamic layouts
 loadProductDetail();
});

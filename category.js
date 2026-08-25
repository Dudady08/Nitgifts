/* ==========================================================================
  Nit Gifts - Category Page Controllers & Filtering Logic
  ========================================================================== */

// 1. Category Meta Configuration
const categoryMeta = {
 canecas: {
  title: "Canecas",
  desc: "Canecas artísticas com designs e personalizáveis",
  showSizes: false
 },
 "placas-mdf": {
  title: "Placas MDF",
  desc: "Placas decorativas em MDF com acabamento premium",
  showSizes: false
 },
 gifts: {
  title: "GIFTS",
  desc: "Ímãs decorativos com arte autoral para sua coleção",
  showSizes: false
 },
 camisetas: {
  title: "GIFTS",
  desc: "Camisetas premium com estampas em algodão de alta gramatura",
  showSizes: true
 },
 ecobags: {
  title: "Ecobags",
  desc: "Ecobags sustentáveis com designs artísticos e resistentes",
  showSizes: false
 },
 moletons: {
  title: "GIFTS",
  desc: "Moletons oversized premium com arte bordada e estampada",
  showSizes: true
 },
};

const colorOptions = [
 { name: "Todas as Cores", value: "all", isAll: true },
 { name: "Preto", value: "preto", hex: "#1A1A1A" },
 { name: "Branco", value: "branc", hex: "#FFFFFF" },
 { name: "Azul", value: "azul", hex: "#4D51FF" },
 { name: "Verde", value: "verde", hex: "#22C55E" },
 { name: "Vermelho", value: "vermelho", hex: "#EF4444" },
 { name: "Laranja", value: "laranja", hex: "#F97316" },
 { name: "Rosa", value: "rosa", hex: "#EC4899" },
 { name: "Marrom", value: "marrom", hex: "#8B4513" },
 { name: "Roxo", value: "roxo", hex: "#A855F7" },
];

const sizeOptions = ["P", "M", "G", "GG", "Único"];



// 4. Global State variables
let activeCategory = "canecas";
let currentFilters = {
 type: "all",
 price: "all",
 color: "all",
 size: "all"
};
let isFirstLoad = true;

// 5. Detect and Load Category Details
function detectCategory() {
 const queryParams = new URLSearchParams(window.location.search);
 const cParam = queryParams.get('c') || queryParams.get('category');
 if (cParam && categoryMeta[cParam.toLowerCase()]) {
  return cParam.toLowerCase();
 }

 const hash = window.location.hash.replace('#', '').toLowerCase();
 if (hash && categoryMeta[hash]) {
  return hash;
 }

 // Detect using filename (e.g., /canecas.html -> canecas)
 const path = window.location.pathname;
 const filename = path.split('/').pop().replace('.html', '').toLowerCase();
 if (categoryMeta[filename]) {
  return filename;
 }

 // Default fallback if unspecified
 return "canecas";
}

function updateCategoryHeader(meta) {
 const titleHeading = document.getElementById('category-title-heading');
 const descPara = document.getElementById('category-desc-para');
 const pageTitle = document.querySelector('title');

 if (titleHeading) titleHeading.textContent = meta.title;
 if (descPara) descPara.textContent = meta.desc;
 if (pageTitle) pageTitle.textContent = `Nit Gifts | ${meta.title}`;
}

// Preload hover images for current category
function preloadCategoryHovers(category) {
 mockProducts
  .filter(p => p.category === category)
  .forEach(p => {
   if (p.hover_image_url) {
    const img = new Image();
    img.src = p.hover_image_url;
   }
  });
}

// 6. Sidebar/Drawer Filter Controls Generator
function compileFilterContentHTML(showSizes) {
 // --- TYPE OPTIONS ---
 let typesList;
 if (activeCategory === 'canecas') {
  typesList = [
   { label: "Todas", value: "all" },
   { label: "Caneca Mágica", value: "magica" },
   { label: "Asa Coração", value: "coracao" },
   { label: "Asa Colorida", value: "colorida" }
  ];
 } else {
  typesList = [
   { label: "Todos", value: "all" },
   { label: "Exclusivas", value: "exclusivo" },
   { label: "Personalizados", value: "personalizado" },
  ];
 }
 let typeHTML = typesList.map(opt => `
  <button class="filter-btn ${currentFilters.type === opt.value ? 'active' : ''}" 
      data-filter-key="type" data-filter-value="${opt.value}">
   ${opt.label}
  </button>
 `).join('');

 // --- PRICE OPTIONS ---
 const priceList = [
  { label: "Todos", value: "all" },
  { label: "Até R$ 50", value: "0-50" },
  { label: "R$ 50 – R$ 100", value: "50-100" },
  { label: "R$ 100 – R$ 200", value: "100-200" },
  { label: "Acima de R$ 200", value: "200+" },
 ];
 let priceHTML = priceList.map(opt => `
  <button class="filter-btn ${currentFilters.price === opt.value ? 'active' : ''}" 
      data-filter-key="price" data-filter-value="${opt.value}">
   ${opt.label}
  </button>
 `).join('');

 // --- COLOR OPTIONS ---
 const colorFilterKey = activeCategory === 'canecas' ? 'cor-asa' : 'color';
 
 let colorHTML = colorOptions.map(c => {
  let extraStyle = '';
  let extraClass = '';
  if (c.isAll) {
   extraStyle = 'border: 2px solid #EF4444; background: linear-gradient(to top right, transparent calc(50% - 1px), #EF4444, transparent calc(50% + 1px)); background-color: #fff;';
   extraClass = 'color-btn-all';
  } else {
   extraStyle = `background-color: ${c.hex};`;
  }
  
  return `
  <button class="color-btn ${extraClass} ${currentFilters[colorFilterKey] === c.value ? 'active' : ''}" 
      data-filter-key="${colorFilterKey}" data-filter-value="${c.value}"
      style="${extraStyle}" 
      title="${activeCategory === 'canecas' ? 'Cor da Asa: ' + c.name : c.name}">
  </button>
  `;
 }).join('');

 // --- SIZE OPTIONS ---
 let sizeHTML = '';
 if (showSizes) {
  sizeHTML = `
   <div class="filter-group">
    <h4 class="filter-group-title">Modelo</h4>
    <div class="size-filter-grid">
     ${sizeOptions.map(s => `
      <button class="size-btn ${currentFilters.size === s ? 'active' : ''}" 
          data-filter-key="size" data-filter-value="${s}">
       ${s}
      </button>
     `).join('')}
    </div>
   </div>
  `;
 }

 return `
  <div class="filter-group">
   <h4 class="filter-group-title">Tipo</h4>
   <div class="filter-options-list">
    ${typeHTML}
   </div>
  </div>

  <div class="filter-group">
   <h4 class="filter-group-title">Preço</h4>
   <div class="filter-options-list">
    ${priceHTML}
   </div>
  </div>

  ${(activeCategory !== 'gifts' && activeCategory !== 'placas-mdf') ? `
  <div class="filter-group">
   <h4 class="filter-group-title">${activeCategory === 'canecas' ? 'Cor da Asa' : 'Cor'}</h4>
   <div class="color-filter-grid">
    ${colorHTML}
   </div>
  </div>
  ` : ''}

  ${sizeHTML}
 `;
}

function bindFilterActionListeners(container) {
 const buttons = container.querySelectorAll('button[data-filter-key]');
 buttons.forEach(btn => {
  btn.addEventListener('click', (e) => {
   e.preventDefault();
   const key = btn.getAttribute('data-filter-key');
   let val = btn.getAttribute('data-filter-value');

   // Toggling behaviors for Colors and Sizes (clicking again resets to 'all')
   if ((key === 'color' || key === 'size') && currentFilters[key] === val) {
    val = 'all';
   }

   // Update Filter State
   currentFilters[key] = val;

   // Sync and Rerender Filter Controls in both wrappers
   syncFiltersUI();



   // Update Grid results
   updateProductsDisplay();
  });
 });
}

function syncFiltersUI() {
 const meta = categoryMeta[activeCategory];
 const showSizes = meta ? meta.showSizes : false;

 const desktopContainer = document.getElementById('desktop-filters-container');
 const drawerContainer = document.getElementById('drawer-filters-content');

 const contentHTML = compileFilterContentHTML(showSizes);

 if (desktopContainer) {
  desktopContainer.innerHTML = contentHTML;
  bindFilterActionListeners(desktopContainer);
 }

 if (drawerContainer) {
  drawerContainer.innerHTML = contentHTML;
  bindFilterActionListeners(drawerContainer);
 }

 // Update active filters badge counter (excludes defaults 'all')
 const activeCount = Object.values(currentFilters).filter(v => v && v !== 'all').length;
 const activeBadge = document.getElementById('mobile-active-filter-badge');
 if (activeBadge) {
  if (activeCount > 0) {
   activeBadge.textContent = activeCount;
   activeBadge.style.display = 'flex';
  } else {
   activeBadge.style.display = 'none';
  }
 }
}

// 7. Product List Live Renderer
function updateProductsDisplay() {
 const grid = document.getElementById('category-products-grid');
 const emptyContainer = document.getElementById('empty-state-container');
 const countTextDesktop = document.getElementById('products-count-text-desktop');
 const countTextMobile = document.getElementById('products-count-text-mobile');

 if (!grid) return;

 // Filter based on active category
 let categoryProducts = mockProducts.filter(p => p.category === activeCategory);

 // Apply active selection filters
 const filteredList = categoryProducts.filter(p => {
  // 1. Filter Type (uses cabo_tipo for canecas, product_type for others)
  if (currentFilters.type && currentFilters.type !== 'all') {
   if (activeCategory === 'canecas') {
    if (p.cabo_tipo !== currentFilters.type) return false;
   } else {
    if (p.product_type !== currentFilters.type) return false;
   }
  }
  // 2. Filter Color
  if (activeCategory === 'canecas') {
   if (currentFilters['cor-asa'] && currentFilters['cor-asa'] !== 'all') {
    const pColors = p.colors || [];
    if (!pColors.some(c => c.toLowerCase().includes(currentFilters['cor-asa']))) return false;
   }
  } else {
   if (currentFilters.color && currentFilters.color !== 'all') {
    const pColors = p.colors || [];
    if (!pColors.some(c => c.toLowerCase().includes(currentFilters.color))) return false;
   }
  }
  // 3. Filter Size
  if (currentFilters.size && currentFilters.size !== 'all') {
   const pSizes = p.sizes || [];
   if (!pSizes.includes(currentFilters.size)) return false;
  }
  // 4. Filter Price range
  if (currentFilters.price && currentFilters.price !== 'all') {
   if (currentFilters.price.includes('+')) {
    const minVal = parseInt(currentFilters.price, 10);
    if (p.price < minVal) return false;
   } else {
    const [min, max] = currentFilters.price.split('-').map(Number);
    if (p.price < min || p.price > max) return false;
   }
  }
  return true;
 });

 // Calculate rendering timing: first load gets transition skeletons, sub-filters load instantly
 const renderDelay = isFirstLoad ? 1200 : 0;
 if (isFirstLoad) {
  grid.innerHTML = `
   <div class="skeleton-card"><div class="skeleton-image"></div><div class="skeleton-line short"></div><div class="skeleton-line long"></div></div>
   <div class="skeleton-card"><div class="skeleton-image"></div><div class="skeleton-line short"></div><div class="skeleton-line long"></div></div>
   <div class="skeleton-card"><div class="skeleton-image"></div><div class="skeleton-line short"></div><div class="skeleton-line long"></div></div>
   <div class="skeleton-card"><div class="skeleton-image"></div><div class="skeleton-line short"></div><div class="skeleton-line long"></div></div>
  `;
  grid.classList.add('loading-state');
  if (emptyContainer) emptyContainer.style.display = 'none';
 }

 setTimeout(() => {
  isFirstLoad = false;
  grid.innerHTML = '';
  grid.classList.remove('loading-state');

  // Update product counters text
  const countVal = filteredList.length;
  const descText = countVal === 1 ? '1 produto encontrado' : `${countVal} produtos encontrados`;
  const mobileText = countVal === 1 ? '1 produto' : `${countVal} produtos`;

  if (countTextDesktop) countTextDesktop.textContent = descText;
  if (countTextMobile) countTextMobile.textContent = mobileText;

  if (countVal === 0) {
   if (emptyContainer) emptyContainer.style.display = 'block';
   return;
  }

  if (emptyContainer) emptyContainer.style.display = 'none';

  filteredList.forEach((product, i) => {
   const cardWrapper = document.createElement('div');
   cardWrapper.className = 'product-card-wrapper';
   cardWrapper.style.animationDelay = `${i * 0.08}s`;

   // Badges
   let badgesHTML = '';
   if (product.is_limited_edition) {
    badgesHTML += `<span class="badge badge-limited">Edição Limitada</span>`;
   }
   if (product.is_new) {
    badgesHTML += `<span class="badge badge-new">Novo</span>`;
   }
   if (product.product_type === "personalizado") {
    let badgeText = "Personalizável";
    let showBadge = true;
    if (product.category === "canecas" && !product.name.toLowerCase().includes("sophia")) {
     badgeText = "Exclusiva";
    } else if (product.category === "placas-mdf") {
     showBadge = false;
    }
    if (showBadge) {
     badgesHTML += `<span class="badge badge-custom">${badgeText}</span>`;
    }
   }

   // Prices
   let priceHTML = '';
   if (product.original_price && product.original_price > product.price) {
    priceHTML += `<span class="price-original">R$ ${product.original_price.toFixed(2).replace('.', ',')}</span>`;
   }
   priceHTML += `<span class="price-current">R$ ${product.price.toFixed(2).replace('.', ',')}</span>`;

   // Category text format helper
   const categoryLabel = product.category === 'placas-mdf'
    ? 'Placas MDF'
    : product.category.charAt(0).toUpperCase() + product.category.slice(1);

   cardWrapper.innerHTML = `
    <a href="product.html?id=${product.id}" class="product-card">
     <div class="product-image-container">
      <img src="${product.image_url}" alt="${product.name}" class="product-img" data-original="${product.image_url}" data-hover="${product.hover_image_url || ''}">
      <div class="badge-list">
       ${badgesHTML}
      </div>
      <div class="quick-add-overlay">
       <div class="quick-add-btn">
        <i data-lucide="shopping-bag" class="icon-sm"></i>
        Ver Produto
       </div>
      </div>
     </div>
     <div class="product-info">
      <p class="product-category">${categoryLabel}</p>
      <h3 class="product-name">${product.name}</h3>
      <div class="price-box">
       ${priceHTML}
      </div>
     </div>
    </a>
   `;

   // Interactivity: image hovers swap
   const img = cardWrapper.querySelector('.product-img');
   const imgContainer = cardWrapper.querySelector('.product-image-container');
   const hoverUrl = img.getAttribute('data-hover');

   if (hoverUrl) {
    imgContainer.addEventListener('mouseenter', () => {
     img.src = hoverUrl;
    });
    imgContainer.addEventListener('mouseleave', () => {
     img.src = img.getAttribute('data-original');
    });
   }

   grid.appendChild(cardWrapper);
  });

  // Reinitialize newly compiled lucide icons
  if (window.lucide) {
   window.lucide.createIcons();
  }
 }, renderDelay);
}

// 8. Mobile Drawer Open/Close Controllers
function initMobileDrawer() {
 const overlay = document.getElementById('mobile-drawer-overlay');
 const openBtn = document.getElementById('open-drawer-btn');
 const closeBtn = document.getElementById('close-drawer-btn');
 const applyBtn = document.getElementById('apply-filters-btn');

 function openDrawer() {
  if (overlay) overlay.classList.add('open');
  document.body.style.overflow = 'hidden'; // Lock background scrolling
 }

 function closeDrawer() {
  if (overlay) overlay.classList.remove('open');
  document.body.style.overflow = ''; // Unlock background scrolling
 }

 if (openBtn) openBtn.addEventListener('click', openDrawer);
 if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
 if (applyBtn) applyBtn.addEventListener('click', closeDrawer);

 // Close when overlay clicked outside container
 if (overlay) {
  overlay.addEventListener('click', (e) => {
   if (e.target === overlay) {
    closeDrawer();
   }
  });
 }
}

// 9. Initializer Lifecycle
function initCategoryPage() {
 if (typeof mockProducts === 'undefined') {
  setTimeout(initCategoryPage, 50);
  return;
 }

 // Detect category from URL
 activeCategory = detectCategory();
 currentFilters.type = "all"; // Reset type filter for fresh load

 const meta = categoryMeta[activeCategory];
 if (meta) {
  updateCategoryHeader(meta);
 } else {
  // Fallback headers if category meta not matched
  updateCategoryHeader({ title: activeCategory, desc: "", showSizes: false });
 }

 // Preload category hovers
 preloadCategoryHovers(activeCategory);

 // Setup reactive sidebar and drawer templates
 syncFiltersUI();

 // Populate products
 updateProductsDisplay();

 // Initialize mobile interactions
 initMobileDrawer();

 // Setup base layout SVGs parsing
 if (window.lucide) {
  window.lucide.createIcons();
 }
}

document.addEventListener('DOMContentLoaded', initCategoryPage);


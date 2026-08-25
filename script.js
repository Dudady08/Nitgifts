/* ==========================================================================
  Nit Gifts - Frontend Interactions & Dynamic Data
  ========================================================================== */



// Preload hover images for zero-delay, flicker-free UX
function preloadHoverImages() {
 if (typeof mockProducts === 'undefined') return;
 mockProducts.forEach(product => {
  if (product.hover_image_url) {
   const img = new Image();
   img.src = product.hover_image_url;
  }
 });
}

// 2. Hero Section Slide Show Controller
function initHeroSlider() {
 const slides = document.querySelectorAll('.hero-slide');
 const indicators = document.querySelectorAll('.indicator');
 let currentSlide = 0;
 let sliderTimer = null;
 const slideDuration = 5500; // 5.5s, matches React useEffect timer

 function showSlide(index) {
  // Wrap index around if boundary exceeded
  if (index >= slides.length) index = 0;
  if (index < 0) index = slides.length - 1;

  // Reset current active states
  slides[currentSlide].classList.remove('active');
  indicators[currentSlide].classList.remove('active');

  // Activate new slide states
  slides[index].classList.add('active');
  indicators[index].classList.add('active');

  currentSlide = index;
 }

 function nextSlide() {
  showSlide(currentSlide + 1);
 }

 function startAutoplay() {
  stopAutoplay();
  sliderTimer = setInterval(nextSlide, slideDuration);
 }

 function stopAutoplay() {
  if (sliderTimer) {
   clearInterval(sliderTimer);
   sliderTimer = null;
  }
 }

 // Bind indicator click event
 indicators.forEach(indicator => {
  indicator.addEventListener('click', () => {
   const slideIndex = parseInt(indicator.getAttribute('data-slide'), 10);
   showSlide(slideIndex);
   startAutoplay(); // Reset autoplay timer on click
  });
 });

 // Start slider lifecycle
 startAutoplay();
}

// 3. Dynamic Products Render Function
function renderShowcase(sectionId, filterFn) {
 const section = document.getElementById(sectionId);
 if (!section) return;

 const grid = section.querySelector('.products-grid');
 if (!grid) return;

 // Filter local database products using React counterparts rules
 const filteredProducts = mockProducts.filter(filterFn).slice(0, 4);

 // If no products matched, hide the whole section (matches return null in React)
 if (filteredProducts.length === 0) {
  section.style.display = 'none';
  return;
 }

 // Clear skeleton loading after dynamic delay (mimicking async fetching state)
 setTimeout(() => {
  grid.innerHTML = '';
  grid.classList.remove('loading-state');

  filteredProducts.forEach((product, i) => {
   const cardWrapper = document.createElement('div');
   cardWrapper.className = 'product-card-wrapper';
   // Fade-up stagger effect matching Framer Motion index delay
   cardWrapper.style.animationDelay = `${i * 0.08}s`;

   // Dynamic badges compiling
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

   // Dynamic price tags compiling
   let priceHTML = '';
   if (product.original_price && product.original_price > product.price) {
    priceHTML += `<span class="price-original">R$ ${product.original_price.toFixed(2).replace('.', ',')}</span>`;
   }
   priceHTML += `<span class="price-current">R$ ${product.price.toFixed(2).replace('.', ',')}</span>`;

   // Category display text normalization
   const displayCategory = product.category === 'placas-mdf'
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
      <p class="product-category">${displayCategory}</p>
      <h3 class="product-name">${product.name}</h3>
      <div class="price-box">
       ${priceHTML}
      </div>
     </div>
    </a>
   `;

   // Product Image Hover Swap Interaction
   const img = cardWrapper.querySelector('.product-img');
   const container = cardWrapper.querySelector('.product-image-container');
   const hoverUrl = img.getAttribute('data-hover');

   if (hoverUrl) {
    container.addEventListener('mouseenter', () => {
     img.src = hoverUrl;
    });
    container.addEventListener('mouseleave', () => {
     img.src = img.getAttribute('data-original');
    });
   }

   grid.appendChild(cardWrapper);
  });

  // Rerender Lucide SVG Icons to parse the newly added shopping-bag tags
  if (window.lucide) {
   window.lucide.createIcons();
  }
 }, 1200); // 1.2s loading state mimic
}

// 4. Toast Notification helper for checkout redirect success messages
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

// 5. Initializer Lifecycle
function initPage() {
 if (typeof mockProducts === 'undefined') {
  // products-data.js may not have loaded yet, retry
  setTimeout(initPage, 50);
  return;
 }

 // Preload hovers immediately
 preloadHoverImages();

 // Initialize sliders
 initHeroSlider();

 // Initializing dynamic product showcases
 renderShowcase('showcase-canecas', p => p.category === 'canecas' && p.cabo_tipo !== 'magica');
 renderShowcase('showcase-placas-mdf', p => p.category === 'placas-mdf');
 renderShowcase('showcase-gifts', p => p.category === 'gifts');

 // Check if we redirected from a successful checkout order
 try {
  if (localStorage.getItem('orderSuccessToast') === 'true') {
   localStorage.removeItem('orderSuccessToast');
   setTimeout(() => {
    showToast("Pedido realizado com sucesso!", "Você receberá um e-mail com os detalhes.");
   }, 500);
  }
 } catch (e) { /* localStorage may be restricted */ }

 // Initialize static Lucide Icons already in index.html (like arrow-right, sparkles, stars)
 if (window.lucide) {
  window.lucide.createIcons();
 }
}

document.addEventListener('DOMContentLoaded', initPage);


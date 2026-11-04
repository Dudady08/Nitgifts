/* ==========================================================================
  Nit Gifts - Global Layout Loader (Navbar, Footer, WhatsApp Button & Cart Sync)
  ========================================================================== */

// 1. Dynamic HTML Templates
const navbarHTML = `
 <header id="global-navbar" class="py-4 bg-transparent">
  <div class="max-w-[1400px] mx-auto px-5 md:px-10 flex items-center justify-between">
   <a href="index.html" class="navbar-brand-link" aria-label="Nit Gifts">
    <img src="icone-nitgifts.png" alt="Nit Gifts" class="navbar-brand-logo">
   </a>

   <nav class="hidden lg:flex items-center gap-8">
    <a href="category.html?c=canecas" class="nav-link">Canecas</a>
    <a href="category.html?c=placas-mdf" class="nav-link">Placas MDF</a>
    <a href="category.html?c=gifts" class="nav-link">GIFTS</a>
    </nav>

   <div class="flex items-center gap-4">
    <a href="account.html" class="relative p-2 hover:bg-[#1A1A1A]/5 rounded-full transition-colors flex items-center justify-center" id="navbar-account-btn" title="Minha Conta">
     <i data-lucide="user" style="width: 20px; height: 20px; stroke-width: 1.5;"></i>
    </a>
    <a href="cart.html" class="relative p-2 hover:bg-[#1A1A1A]/5 rounded-full transition-colors flex items-center justify-center" id="navbar-cart-btn">
     <i data-lucide="shopping-bag" style="width: 20px; height: 20px; stroke-width: 1.5;"></i>
     <span class="cart-badge" id="navbar-cart-count" style="display: none;">0</span>
    </a>
    <button class="lg:hidden p-2 hover:bg-[#1A1A1A]/5 rounded-full transition-colors flex items-center justify-center" id="mobile-menu-trigger">
     <i data-lucide="menu" style="width: 22px; height: 22px; stroke-width: 1.5;"></i>
    </button>
   </div>
  </div>
 </header>

 <!-- Full-screen Mobile Menu Drawer -->
 <div id="mobile-menu-drawer">
  <div class="flex items-center justify-between px-5 py-4">
   <a href="index.html" class="navbar-brand-link" aria-label="Nit Gifts">
    <img src="icone-nitgifts.png" alt="Nit Gifts" class="navbar-brand-logo">
   </a>
   <button class="p-2 flex items-center justify-center" id="mobile-menu-close" style="background: none; border: none; cursor: pointer;">
    <i data-lucide="x" style="width: 24px; height: 24px; stroke-width: 1.5; color: var(--color-dark);"></i>
   </button>
  </div>
  <nav class="mobile-menu-nav flex-1 flex flex-col justify-center items-center px-10 gap-6">
   <div class="mobile-nav-item" style="transition-delay: 0.0s;"><a href="category.html?c=canecas" class="mobile-drawer-link">Canecas</a></div>
   <div class="mobile-nav-item" style="transition-delay: 0.06s;"><a href="category.html?c=placas-mdf" class="mobile-drawer-link">Placas MDF</a></div>
   <div class="mobile-nav-item" style="transition-delay: 0.12s;"><a href="category.html?c=gifts" class="mobile-drawer-link">GIFTS</a></div>
   <div class="mobile-nav-item" style="transition-delay: 0.18s;"><a href="account.html" class="mobile-drawer-link">Minha Conta</a></div>
   <div class="mobile-nav-item" style="transition-delay: 0.24s;"><a href="contact.html" class="mobile-drawer-link">Contato</a></div>
  </nav>
 </div>
`;

const footerHTML = `
 <footer class="global-footer mt-20" style="background-color: #D4AF37; color: var(--color-dark); width: 100%;">
  <!-- Ticker Tape Banner -->
  <div class="ticker-wrapper overflow-hidden py-4" style="border-bottom: 1px solid rgba(0, 0, 0, 0.2);">
   <div class="ticker-content">
    <div class="ticker-text-block">FRETE PARA TODO BRASIL • EDIÇÕES EXCLUSIVAS • SUA ARTE, NOSSO OFÍCIO • QUALIDADE PREMIUM •&nbsp;</div>
    <div class="ticker-text-block">FRETE PARA TODO BRASIL • EDIÇÕES EXCLUSIVAS • SUA ARTE, NOSSO OFÍCIO • QUALIDADE PREMIUM •&nbsp;</div>
    <div class="ticker-text-block">FRETE PARA TODO BRASIL • EDIÇÕES EXCLUSIVAS • SUA ARTE, NOSSO OFÍCIO • QUALIDADE PREMIUM •&nbsp;</div>
    <div class="ticker-text-block">FRETE PARA TODO BRASIL • EDIÇÕES EXCLUSIVAS • SUA ARTE, NOSSO OFÍCIO • QUALIDADE PREMIUM •&nbsp;</div>
   </div>
  </div>

  <div class="max-w-[1400px] mx-auto px-5 md:px-10 py-12 md:py-16">
   <div class="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-16">
    
    <!-- Col 1: Brand details -->
    <div>
     <h3 class="font-display text-2xl font-extrabold mb-4" style="font-family: var(--font-display);">
      NIT GIFTS
     </h3>
     <p class="opacity-80 text-sm leading-relaxed max-w-xs" style="color: rgba(0, 0, 0, 0.8);">
      Presentes e decorações artísticas. Cada peça conta uma história.
     </p>
    </div>

    <!-- Col 2: Categories -->
    <div>
     <h4 class="font-display text-sm font-bold uppercase tracking-widest mb-5" style="font-family: var(--font-display); letter-spacing: 0.15em;">Categorias</h4>
     <div class="flex flex-col gap-2">
      <a href="category.html?c=canecas" class="text-sm footer-link">Canecas</a>
      <a href="category.html?c=placas-mdf" class="text-sm footer-link">Placas MDF</a>
      <a href="category.html?c=gifts" class="text-sm footer-link">GIFTS</a>
      </div>
    </div>

    <!-- Col 3: Contact / Support links -->
    <div>
     <h4 class="font-display text-sm font-bold uppercase tracking-widest mb-5" style="font-family: var(--font-display); letter-spacing: 0.15em;">Contato</h4>
     <div class="flex flex-col gap-3">
      <a href="contact.html" class="text-sm footer-link flex items-center gap-2">
       <i data-lucide="mail" class="icon-sm"></i> Fale Conosco
      </a>
      <a href="https://wa.me/5511974962380" target="_blank" rel="noopener noreferrer" class="text-sm footer-link flex items-center gap-2">
       <i data-lucide="message-circle" class="icon-sm"></i> WhatsApp
      </a>
      <a href="https://instagram.com/nitgifts/" target="_blank" rel="noopener noreferrer" class="text-sm footer-link flex items-center gap-2">
       <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-sm"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg> Instagram
      </a>
      <a href="https://lista.mercadolivre.com.br/_CustId_2125905437" target="_blank" rel="noopener noreferrer" class="text-sm footer-link flex items-center gap-2">
       <i data-lucide="shopping-bag" class="icon-sm"></i> Mercado Livre
      </a>
     </div>
    </div>
   </div>

   <!-- Bottom copyright row -->
   <div class="border-t border-black/20 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4" style="border-top: 1px solid rgba(0, 0, 0, 0.2);">
    <p class="text-xs" style="color: rgba(0, 0, 0, 0.6);">© 2026 Nit Gifts Todos os direitos reservados.</p>
    <div class="flex gap-6">
     <a href="contact.html" class="text-xs footer-bottom-link">Política de Privacidade</a>
     <a href="contact.html" class="text-xs footer-bottom-link">Termos de Uso</a>
    </div>
   </div>
  </div>
 </footer>
`;

const whatsappBtnHTML = `
 <a
  href="https://wa.me/5511974962380?text=Olá! Vim pelo site e gostaria de mais informações."
  target="_blank"
  rel="noopener noreferrer"
  class="whatsapp-float-btn"
  aria-label="WhatsApp"
 >
  <i data-lucide="message-circle" style="width: 26px; height: 26px; stroke-width: 2;"></i>
 </a>
`;

// 2. LocalStorage Sync & Cart Count Updater
function updateNavbarCartCount() {
 const badge = document.getElementById('navbar-cart-count');
 if (!badge) return;

 let cart = [];
 try {
  cart = JSON.parse(localStorage.getItem('cart') || '[]');
 } catch (e) {
  // localStorage may be blocked in some contexts (e.g., file://, private mode)
  cart = [];
 }
 const count = cart.reduce((sum, item) => sum + item.qty, 0);

 if (count > 0) {
  badge.textContent = count;
  badge.style.display = 'flex';
 } else {
  badge.style.display = 'none';
 }
}

// 3. Document Injector & Controllers Setup
function injectGlobalLayout() {
 // Prepend Navbar templates
 const navContainer = document.createElement('div');
 navContainer.innerHTML = navbarHTML;
 document.body.insertBefore(navContainer.children[0], document.body.firstChild);
 document.body.appendChild(navContainer.children[0]); // append drawer

 // Append Footer template
 const footerContainer = document.createElement('div');
 footerContainer.innerHTML = footerHTML;
 document.body.appendChild(footerContainer.children[0]);

 // Append WhatsApp floating template
 const waContainer = document.createElement('div');
 waContainer.innerHTML = whatsappBtnHTML;
 document.body.appendChild(waContainer.children[0]);

 // Sync badge count initially
 updateNavbarCartCount();

 // Scroll Header background change trigger
 const updateNavbarScrollState = () => {
  const navbar = document.getElementById('global-navbar');
  if (!navbar) return;
  const hero = document.getElementById('hero');
  const threshold = hero ? Math.max(40, hero.offsetHeight - navbar.offsetHeight) : 40;
  if (window.scrollY >= threshold) {
   navbar.classList.add('scrolled');
  } else {
   navbar.classList.remove('scrolled');
  }
 };

 window.addEventListener('scroll', updateNavbarScrollState, { passive: true });
 window.addEventListener('resize', updateNavbarScrollState);
 updateNavbarScrollState();

 // Mobile Menu Trigger bindings
 const openTrigger = document.getElementById('mobile-menu-trigger');
 const closeTrigger = document.getElementById('mobile-menu-close');
 const drawer = document.getElementById('mobile-menu-drawer');

 if (openTrigger && drawer) {
  openTrigger.addEventListener('click', () => {
   drawer.classList.add('open');
  });
 }

 if (closeTrigger && drawer) {
  closeTrigger.addEventListener('click', () => {
   drawer.classList.remove('open');
  });
 }

 // Bind storage sync callbacks
 window.addEventListener('cart-updated', updateNavbarCartCount);
 window.addEventListener('storage', updateNavbarCartCount);

 // Render static icons generated dynamically by layouts injection
 if (window.lucide) {
  window.lucide.createIcons();
 }
}

// 4. Initializer Lifecycle
document.addEventListener('DOMContentLoaded', () => {
 injectGlobalLayout();
});

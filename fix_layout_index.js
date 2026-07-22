const fs = require('fs');

// 1. Update index.html
let html = fs.readFileSync('index.html', 'utf8');

// Replace showcase 1 (was Novidades)
html = html.replace(/<section id="showcase-new".*?<\/section>/s, 
    <section id="showcase-canecas" class="product-showcase-section">
      <div class="showcase-header">
        <div>
          <p class="showcase-subtitle">O clássico</p>
          <h2 class="showcase-title">Canecas</h2>
        </div>
        <a href="category.html?c=canecas" class="showcase-link-desktop">
          Ver todas <i data-lucide="arrow-right" class="icon-sm"></i>
        </a>
      </div>
      <div class="products-grid loading-state">
        <div class="skeleton-card"><div class="skeleton-image"></div><div class="skeleton-line short"></div><div class="skeleton-line long"></div></div>
      </div>
      <div class="showcase-footer-mobile">
        <a href="category.html?c=canecas" class="showcase-link-mobile">
          Ver todas <i data-lucide="arrow-right" class="icon-sm"></i>
        </a>
      </div>
    </section>
);

// Replace showcase 2 (was Mais Vendidos)
html = html.replace(/<section id="showcase-bestsellers".*?<\/section>/s, 
    <section id="showcase-placas-mdf" class="product-showcase-section">
      <div class="showcase-header">
        <div>
          <p class="showcase-subtitle">Decoração</p>
          <h2 class="showcase-title">Placas de MDF</h2>
        </div>
        <a href="category.html?c=placas-mdf" class="showcase-link-desktop">
          Ver todas <i data-lucide="arrow-right" class="icon-sm"></i>
        </a>
      </div>
      <div class="products-grid loading-state">
        <div class="skeleton-card"><div class="skeleton-image"></div><div class="skeleton-line short"></div><div class="skeleton-line long"></div></div>
      </div>
      <div class="showcase-footer-mobile">
        <a href="category.html?c=placas-mdf" class="showcase-link-mobile">
          Ver todas <i data-lucide="arrow-right" class="icon-sm"></i>
        </a>
      </div>
    </section>
);

// Replace showcase 3 (was Edições Limitadas)
html = html.replace(/<section id="showcase-limited".*?<\/section>/s, 
    <section id="showcase-gifts" class="product-showcase-section">
      <div class="showcase-header">
        <div>
          <p class="showcase-subtitle">Presentes</p>
          <h2 class="showcase-title">GIFTS</h2>
        </div>
        <a href="category.html?c=gifts" class="showcase-link-desktop">
          Ver todas <i data-lucide="arrow-right" class="icon-sm"></i>
        </a>
      </div>
      <div class="products-grid loading-state">
        <div class="skeleton-card"><div class="skeleton-image"></div><div class="skeleton-line short"></div><div class="skeleton-line long"></div></div>
      </div>
      <div class="showcase-footer-mobile">
        <a href="category.html?c=gifts" class="showcase-link-mobile">
          Ver todas <i data-lucide="arrow-right" class="icon-sm"></i>
        </a>
      </div>
    </section>
);

fs.writeFileSync('index.html', html, 'utf8');

// 2. Update script.js
let js = fs.readFileSync('script.js', 'utf8');
js = js.replace(/renderShowcase\('showcase-bestsellers'.*?\);/g, "renderShowcase('showcase-canecas', p => p.category === 'canecas' && p.cabo_tipo !== 'magica');");
js = js.replace(/renderShowcase\('showcase-new'.*?\);/g, "renderShowcase('showcase-placas-mdf', p => p.category === 'placas-mdf');");
js = js.replace(/renderShowcase\('showcase-limited'.*?\);/g, "renderShowcase('showcase-gifts', p => p.category === 'gifts');");
fs.writeFileSync('script.js', js, 'utf8');

console.log('Updated index.html layout and script.js rendering logic.');

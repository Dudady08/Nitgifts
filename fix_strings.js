const fs = require('fs');

const files = fs.readdirSync('.').filter(f => f.endsWith('.html') || f.endsWith('.js'));

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // Nit Gifts -> Nit Gifts (preserving case appropriately)
  content = content.replace(/Nit Gifts(?!\.)/g, 'Nit Gifts');
  content = content.replace(/NIT GIFTS(?!\.)/g, 'NIT GIFTS');
  
  // Specifically for layout.js, update links
  if (file === 'layout.js') {
    content = content.replace(/category\.html\?c=imas/g, 'category.html?c=gifts');
    content = content.replace(/>[^<]*[IÍií][m][aã][s][^<]*</gi, '>GIFTS<');
    // Because of the encoding issue, also catch literally 'ms'
    content = content.replace(/>\ufffdm\ufffds</gi, '>GIFTS<');
    
    // Remove Camisetas, Ecobags, Moletons from layout.js
    content = content.replace(/<a href="category\.html\?c=camisetas".*?<\/a>\s*/g, '');
    content = content.replace(/<a href="category\.html\?c=ecobags".*?<\/a>\s*/g, '');
    content = content.replace(/<a href="category\.html\?c=moletons".*?<\/a>\s*/g, '');
    content = content.replace(/<div class="mobile-nav-item".*?camisetas.*?<\/div>\s*/g, '');
    content = content.replace(/<div class="mobile-nav-item".*?ecobags.*?<\/div>\s*/g, '');
    content = content.replace(/<div class="mobile-nav-item".*?moletons.*?<\/div>\s*/g, '');
  }
  
  // category.js updates
  if (file === 'category.js') {
    content = content.replace(/imas:/g, 'gifts:');
    content = content.replace(/title:\s*"[^"]*m[^"]*s"/gi, 'title: "GIFTS"');
    content = content.replace(/activeCategory = "camisetas"/g, 'activeCategory = "canecas"');
    content = content.replace(/return "camisetas"/g, 'return "canecas"');
  }
  
  // index.html updates
  if (file === 'index.html') {
    // Remove showcase links
    content = content.replace(/<a href="category\.html\?c=camisetas"[\s\S]*?<\/a>\s*/g, '');
    content = content.replace(/<a href="category\.html\?c=moletons"[\s\S]*?<\/a>\s*/g, '');
    
    // Let's remove the actual categories section items for camisetas, moletons, ecobags
    content = content.replace(/<div class="category-card"[\s\S]*?category\.html\?c=camisetas[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/g, '');
    content = content.replace(/<div class="category-card"[\s\S]*?category\.html\?c=moletons[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/g, '');
    // For ecobags, it might exist
    content = content.replace(/<div class="category-card"[\s\S]*?category\.html\?c=ecobags[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/g, '');
  }

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated ${file}`);
  }
});

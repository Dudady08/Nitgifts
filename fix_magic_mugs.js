const fs = require('fs');
let content = fs.readFileSync('products-data.js', 'utf8');
eval(content.replace('const mockProducts =', 'global.mockProducts ='));

// Find the generic magic mug product
const magicMugProductIndex = global.mockProducts.findIndex(p => p.id === 'can-magica-personalizada');
if (magicMugProductIndex === -1) {
  console.log("Could not find the magic mug product!");
  process.exit(1);
}

const magicMugProduct = global.mockProducts[magicMugProductIndex];
const genericMagicImages = magicMugProduct.gallery_urls || [];

// Remove it from the catalog
global.mockProducts.splice(magicMugProductIndex, 1);

// Append the generic images to all other magic mugs
global.mockProducts.forEach(p => {
  if (p.cabo_tipo === 'magica' && p.category === 'canecas') {
    p.gallery_urls = p.gallery_urls || [];
    
    // Add only unique images to avoid duplicates if this script is ever run twice
    genericMagicImages.forEach(imgUrl => {
      if (!p.gallery_urls.includes(imgUrl)) {
        p.gallery_urls.push(imgUrl);
      }
    });
  }
});

// Rewrite products-data.js safely
const newContent = content.replace(/const mockProducts = \[[\s\S]*?\];/, 'const mockProducts = ' + JSON.stringify(global.mockProducts, null, 2) + ';');
fs.writeFileSync('products-data.js', newContent, 'utf8');
console.log("Successfully removed generic magic mug and distributed its images!");

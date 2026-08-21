const fs = require('fs');
let content = fs.readFileSync('products-data.js', 'utf8');
eval(content.replace('const mockProducts =', 'global.mockProducts ='));

global.mockProducts.forEach(p => {
  if (p.category === 'canecas') {
    p.price = 80.0;
    // Optionally update original_price if it's set to something smaller
    if (p.original_price && p.original_price < 80.0) {
      p.original_price = 89.9; // or null
    }
  }
  
  // Check if category is im�s
  if (p.category === 'im�s' || p.category === 'imas') {
    p.category = 'gifts';
  }
});

const newContent = content.replace(/const mockProducts = \[[\s\S]*?\];/, 'const mockProducts = ' + JSON.stringify(global.mockProducts, null, 2) + ';');
fs.writeFileSync('products-data.js', newContent, 'utf8');
console.log('Updated prices and categories in products-data.js');

const fs = require('fs');
let content = fs.readFileSync('products-data.js', 'utf8');
eval(content.replace('const mockProducts =', 'global.mockProducts ='));

global.mockProducts.forEach(p => {
  if (p.category === 'placas-mdf') {
    p.name = p.name.replace(/Placa de MDF /gi, '').replace(/Placa MDF /gi, '').trim();
  }
});

const newContent = content.replace(/const mockProducts = \[[\s\S]*?\];/, 'const mockProducts = ' + JSON.stringify(global.mockProducts, null, 2) + ';');
fs.writeFileSync('products-data.js', newContent, 'utf8');
console.log('Removed Placa MDF prefix from names.');

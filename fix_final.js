const fs = require('fs');

let content = fs.readFileSync('products-data.js', 'utf8');

// Fix broken characters
content = content.replace(/\uFFFDnico/g, 'Único');
content = content.replace(/On\uFFFDa/g, 'Onça');

// Parse the products array
eval(content.replace('const mockProducts =', 'global.mockProducts ='));

// Modify the products
global.mockProducts.forEach(p => {
  if (p.category === 'placas-mdf') {
    p.dimensions = '20x20cm';
    
    // Add the new image to the Studio Ghibli plate
    if (p.name.includes('Ghibli')) {
      const newImg = 'placas-de-mdf/studio-ghibli-todos-os-personagens.jpg';
      if (!p.gallery_urls.includes(newImg)) {
        p.gallery_urls.push(newImg);
      }
    }
  }
});

// Write back
const newContent = content.replace(/const mockProducts = \[[\s\S]*?\];/, 'const mockProducts = ' + JSON.stringify(global.mockProducts, null, 2) + ';');
fs.writeFileSync('products-data.js', newContent, 'utf8');

console.log('Fixed accents, updated dimensions to 20x20cm, and added the new Ghibli image.');

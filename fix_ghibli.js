const fs = require('fs');

let content = fs.readFileSync('products-data.js', 'utf8');
eval(content.replace('const mockProducts =', 'global.mockProducts ='));

const p = global.mockProducts.find(x => x.id === 'mdf-4');
if (p) {
  p.hover_image_url = "placas-de-mdf/studio-ghibli-1.jpg";
  p.gallery_urls = ["placas-de-mdf/studio-ghibli-1.jpg"];
}

const newContent = content.replace(/const mockProducts = \[[\s\S]*?\];/, 'const mockProducts = ' + JSON.stringify(global.mockProducts, null, 2) + ';');
fs.writeFileSync('products-data.js', newContent, 'utf8');
console.log('Fixed Studio Ghibli product images in DB.');

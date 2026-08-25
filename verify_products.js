const fs = require('fs');
const content = fs.readFileSync('products-data.js', 'utf8');
eval(content.replace('const mockProducts =', 'global.mockProducts ='));

const files = fs.readdirSync('canecas site').map(f => 'canecas site/' + f);
const fileSet = new Set(files);

let missing = [];
let toUpdate = [];

global.mockProducts.forEach(p => {
 if (p.category === 'canecas') {
  if (['rosa', 'vermelho', 'azul', 'laranja', 'verde', 'preto', 'marrom'].includes(p.cabo_tipo) || (p.name.toLowerCase().includes('cabo') && p.cabo_tipo === 'comum')) {
    toUpdate.push({ id: p.id, name: p.name, currentType: p.cabo_tipo });
  }

  [p.image_url, p.hover_image_url, ...(p.gallery_urls || [])].forEach(url => {
    if (url && !fileSet.has(url)) {
      const match = files.find(f => f.toLowerCase() === url.toLowerCase());
      if (match) {
        missing.push({ id: p.id, missing: url, suggestion: match });
      } else {
        missing.push({ id: p.id, missing: url, suggestion: 'NOT FOUND' });
      }
    }
  });
 }
});

console.log('To Update Cabo Tipo:', JSON.stringify(toUpdate, null, 2));
console.log('Missing/Broken Images:', JSON.stringify(missing, null, 2));

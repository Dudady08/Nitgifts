const fs = require('fs');
const content = fs.readFileSync('products-data.js', 'utf8');
eval(content.replace('const mockProducts =', 'global.mockProducts ='));

const files = fs.readdirSync('canecas site').map(f => 'canecas site/' + f);
const fileSet = new Set(files);

let missing = [];

global.mockProducts.forEach(p => {
 if (p.category === 'canecas') {
  [p.image_url, p.hover_image_url, ...(p.gallery_urls || [])].forEach(url => {
    if (url && !fileSet.has(url)) {
      const match = files.find(f => f.toLowerCase() === url.toLowerCase());
      if (match) {
        missing.push({ id: p.id, missing: url, suggestion: match, type: 'case/space' });
      } else {
        missing.push({ id: p.id, missing: url, suggestion: 'NOT FOUND', type: 'missing' });
      }
    }
  });
 }
});

console.log('Missing/Broken Images:', JSON.stringify(missing, null, 2));

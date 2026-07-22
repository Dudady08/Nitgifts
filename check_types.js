const fs = require('fs');
const content = fs.readFileSync('products-data.js', 'utf8');
eval(content.replace('const mockProducts =', 'global.mockProducts ='));

const items = global.mockProducts.filter(p => ['can-naruto', 'can-pintura', 'can-signo', 'can-star', 'can-espirito-santo', 'can-marvel', 'can-sao-jorge'].includes(p.id));
console.log(JSON.stringify(items.map(i => ({id: i.id, cabo_tipo: i.cabo_tipo})), null, 2));

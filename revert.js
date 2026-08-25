const fs = require('fs');
const file = 'c:/Users/eduar/Downloads/Site Nitgift/products-data.js';
let content = fs.readFileSync(file, 'utf8');

const match = content.match(/const mockProducts = (\[[\s\S]*?\]);/);
if (match) {
  const data = eval(match[1]);
  data.forEach(p => {
    if (p.category === 'canecas' && p.product_type === 'exclusivo' && !p.name.toLowerCase().includes('sophia')) {
      const idStr = `"id": "${p.id}"`;
      const idIdx = content.indexOf(idStr);
      if (idIdx !== -1) {
        const nextIdIdx = content.indexOf('"id":', idIdx + 1);
        const endIdx = nextIdIdx !== -1 ? nextIdIdx : content.length;
        let block = content.substring(idIdx, endIdx);
        block = block.replace(/"product_type":\s*"exclusivo"/, '"product_type": "personalizado"');
        content = content.substring(0, idIdx) + block + content.substring(endIdx);
      }
    }
  });
  fs.writeFileSync(file, content, 'utf8');
  console.log('Successfully reverted product types.');
}

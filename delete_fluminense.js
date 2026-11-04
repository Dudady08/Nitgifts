const fs = require('fs');

let content = fs.readFileSync('products-data.js', 'utf8');

const match = content.match(/const productsData = (\[.*\]);?/s);
if (!match) {
    process.exit(1);
}

let data = eval(match[1]);

// Remove fluminense entirely so sync_canecas can rebuild it as 2 products
data = data.filter(p => p.id !== 'can-fluminense');

let newArrayStr = '[\n';
for (let i = 0; i < data.length; i++) {
  newArrayStr += '  ' + JSON.stringify(data[i], null, 2).replace(/\n/g, '\n  ');
  if (i < data.length - 1) {
    newArrayStr += ',\n';
  }
}
newArrayStr += '\n]';

content = content.replace(/const productsData = (\[.*\]);?/s, `const productsData = ${newArrayStr};`);
fs.writeFileSync('products-data.js', content, 'utf8');
console.log('Removed fluminense product');

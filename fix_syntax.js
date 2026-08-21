const fs = require('fs');
let c = fs.readFileSync('products-data.js', 'utf8');
c = c.replace(/([^\"])canecas site\//g, '"broken"');
fs.writeFileSync('products-data.js', c);
try {
  eval(c.replace('const mockProducts =', 'global.mockProducts ='));
  console.log("SUCCESS. Valid JS again.");
} catch(e) {
  console.log("STILL BROKEN: " + e.message);
}

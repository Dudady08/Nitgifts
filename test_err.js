const fs = require('fs');
try {
  const c = fs.readFileSync('products-data.js', 'utf8');
  const fixed = c.replace(/image_url:\s*canecas site\/,?\s*/g, 'image_url: "broken",\n')
          .replace(/hover_image_url:\s*canecas site\/,?\s*/g, 'hover_image_url: "broken",\n')
          .replace(/canecas site\/,?\s*/g, '"broken",\n');
  eval(fixed.replace('const mockProducts =', 'global.mockProducts ='));
} catch (e) {
  console.log(e.stack);
}

const fs = require('fs');

let content = fs.readFileSync('products-data.js', 'utf8');

const files = fs.readdirSync('canecas site');

// We need to parse the products and fix the image_url, hover_image_url, and gallery_urls for category: "canecas".
// Since we corrupted it to image_url: "canecas site/", or image_url: canecas site/, or something, 
// let's use a regex to replace the entire block of image fields for canecas.
// The block usually looks like:
// image_url: ...
// hover_image_url: ...
// gallery_urls: [ ... ]
// But instead of complex regex, let's just evaluate the whole products-data.js array, 
// rebuild the array, and output it. Wait, evaluating is hard if syntax is broken.
// Let's see if evaluating works.
try {
  eval(content.replace('const mockProducts =', 'global.mockProducts ='));
} catch (e) {
  console.error('EVAL FAILED: ' + e);
}

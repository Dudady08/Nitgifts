const fs = require('fs');

let content = fs.readFileSync('products-data.js', 'utf8');

// Parse the products array
eval(content.replace('const mockProducts =', 'global.mockProducts ='));

// Add the new Anime product
global.mockProducts.push({
 id: "mdf-6",
 aliases: ["mdf-6"],
 name: "Anime",
 category: "placas-mdf",
 price: 50.0,
 original_price: null,
 image_url: "placas-de-mdf/anime.jpg",
 hover_image_url: "placas-de-mdf/anime.jpg",
 gallery_urls: [
  "placas-de-mdf/anime.jpg"
 ],
 is_bestseller: false,
 is_new: true,
 is_limited_edition: false,
 product_type: "decorativo",
 colors: [],
 sizes: ["Único"],
 material: "MDF Premium",
 dimensions: "20x20cm"
});

// Write back
const newContent = content.replace(/const mockProducts = \[[\s\S]*?\];/, 'const mockProducts = ' + JSON.stringify(global.mockProducts, null, 2) + ';');
fs.writeFileSync('products-data.js', newContent, 'utf8');

console.log('Added Anime MDF plate.');

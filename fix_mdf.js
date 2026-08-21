const fs = require('fs');

let content = fs.readFileSync('products-data.js', 'utf8');
eval(content.replace('const mockProducts =', 'global.mockProducts ='));

// Remove old placas-mdf products
global.mockProducts = global.mockProducts.filter(p => p.category !== 'placas-mdf');

// The files are: BTS.jpg, Luffy.jpg, On�a.jpg, Studio ghibli 1.jpg, Studio ghibli 2.jpg, Zoro.jpg
// We create 5 products
const mdfProducts = [
  { name: "BTS", img: "BTS.jpg" },
  { name: "Luffy", img: "Luffy.jpg" },
  { name: "On�a", img: "On�a.jpg" },
  { name: "Studio Ghibli", img: "Studio ghibli 1.jpg", hover: "Studio ghibli 2.jpg", gallery: ["Studio ghibli 1.jpg", "Studio ghibli 2.jpg"] },
  { name: "Zoro", img: "Zoro.jpg" }
];

let counter = 1;
mdfProducts.forEach(mp => {
  global.mockProducts.push({
    id: "mdf-" + counter,
    aliases: ["mdf-" + counter],
    name: "Placa MDF " + mp.name,
    category: "placas-mdf",
    price: 50.0,
    original_price: null,
    image_url: "Placas de MDF/" + mp.img,
    hover_image_url: mp.hover ? "Placas de MDF/" + mp.hover : "Placas de MDF/" + mp.img,
    gallery_urls: mp.gallery ? mp.gallery.map(g => "Placas de MDF/" + g) : ["Placas de MDF/" + mp.img],
    is_bestseller: false,
    is_new: true,
    is_limited_edition: false,
    product_type: "decorativo",
    colors: [],
    sizes: ["�nico"],
    material: "MDF Premium",
    dimensions: "20x28cm"
  });
  counter++;
});

const newContent = content.replace(/const mockProducts = \[[\s\S]*?\];/, 'const mockProducts = ' + JSON.stringify(global.mockProducts, null, 2) + ';');
fs.writeFileSync('products-data.js', newContent, 'utf8');
console.log('Added 5 Placas de MDF with 50.00 price.');

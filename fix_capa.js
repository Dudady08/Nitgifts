const fs = require('fs');

let content = fs.readFileSync('products-data.js', 'utf8');

// The file exports `const productsData = [...]`
// We will evaluate it, modify the array, and then stringify it back.
const match = content.match(/const productsData = (\[.*\]);?/s);
if (!match) {
    console.error("Could not find productsData array");
    process.exit(1);
}

let data = eval(match[1]);

// We also need to fix mickey-castelo extensions in the JSON strings before eval, or fix them in the objects.
// Fixing in the objects:
function fixUrl(url) {
    if (!url) return url;
    if (url.includes('mickey-castelo') || url.includes('mickey-catelo')) {
        return url.replace('.jpg', '.jpeg');
    }
    return url;
}

function processItem(item) {
    // fix extensions
    item.image_url = fixUrl(item.image_url);
    item.hover_image_url = fixUrl(item.hover_image_url);
    if (item.gallery_urls) {
        item.gallery_urls = item.gallery_urls.map(fixUrl);
    }

    // Sort gallery_urls so "capa" is first
    if (item.gallery_urls && item.gallery_urls.length > 0) {
        item.gallery_urls.sort((a, b) => {
            const aCapa = a.toLowerCase().includes('capa');
            const bCapa = b.toLowerCase().includes('capa');
            if (aCapa && !bCapa) return -1;
            if (!aCapa && bCapa) return 1;
            return 0;
        });

        item.image_url = item.gallery_urls[0];
        item.hover_image_url = item.gallery_urls.length > 1 ? item.gallery_urls[1] : item.gallery_urls[0];
    }
}

data.forEach(product => {
    processItem(product);
    if (product.variants) {
        product.variants.forEach(variant => {
            processItem(variant);
        });
    }
});

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
console.log('Fixed products-data.js successfully');

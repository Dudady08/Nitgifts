const fs = require('fs');

let content = fs.readFileSync('products-data.js', 'utf8');

const match = content.match(/const productsData = (\[.*\]);?/s);
if (!match) {
    console.error("Could not find productsData array");
    process.exit(1);
}

let data = eval(match[1]);

let removedCount = 0;

// Helper to check if an image path exists on disk
function imageExists(url) {
    if (!url) return false;
    return fs.existsSync(url);
}

const newData = data.filter(product => {
    // Check main product image
    let hasValidImage = imageExists(product.image_url);
    
    // If it has variants, check them
    if (product.variants && product.variants.length > 0) {
        // A product is valid if at least one variant has a valid image, OR the main product has a valid image
        let validVariants = product.variants.filter(v => imageExists(v.image_url));
        if (validVariants.length > 0) {
            hasValidImage = true;
            // Also update variants to only keep valid ones
            product.variants = validVariants;
        } else {
            product.variants = [];
        }
    }
    
    if (!hasValidImage) {
        console.log(`Removing product: ${product.name} (${product.id}) - No valid photos found.`);
        removedCount++;
        return false;
    }
    
    return true;
});

let newArrayStr = '[\n';
for (let i = 0; i < newData.length; i++) {
  newArrayStr += '  ' + JSON.stringify(newData[i], null, 2).replace(/\n/g, '\n  ');
  if (i < newData.length - 1) {
    newArrayStr += ',\n';
  }
}
newArrayStr += '\n]';

content = content.replace(/const productsData = (\[.*\]);?/s, `const productsData = ${newArrayStr};`);
fs.writeFileSync('products-data.js', content, 'utf8');
console.log(`Cleanup complete. Removed ${removedCount} products without photos.`);

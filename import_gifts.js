const fs = require('fs');
const path = require('path');

const sourceDir = 'c:\\Users\\eduar\\Downloads\\gifts grande';
const targetDir = 'c:\\Users\\eduar\\Downloads\\Nitgifts-main\\gifts-grandes';
const dataFile = 'c:\\Users\\eduar\\Downloads\\Nitgifts-main\\products-data.js';

function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// 1. Load data and remove previous gift-grandes AND any "ímã" products
let content = fs.readFileSync(dataFile, 'utf8');
const match = content.match(/const productsData = (\[.*\]);?/s);
let data = [];
if (match) {
  data = eval(match[1]);
  // Filter out any previously added gift-grande items
  data = data.filter(p => !p.id.startsWith('gift-grande-'));
}

// 2. Build new products
const folders = fs.readdirSync(sourceDir).filter(f => fs.statSync(path.join(sourceDir, f)).isDirectory());

let newProducts = [];

for (const folder of folders) {
  const folderPath = path.join(sourceDir, folder);
  const targetFolderPath = path.join(targetDir, folder);
  if (!fs.existsSync(targetFolderPath)) {
    fs.mkdirSync(targetFolderPath, { recursive: true });
  }

  const files = fs.readdirSync(folderPath).filter(f => f.toLowerCase().endsWith('.jpg') || f.toLowerCase().endsWith('.jpeg') || f.toLowerCase().endsWith('.png'));
  
  // Group by base name for variants
  const groups = {};
  for (const file of files) {
    let baseName = '';
    const lowerFile = file.toLowerCase();
    
    // Better base name logic
    baseName = lowerFile
        .replace(' capa', '')
        .replace(' geladeira', '')
        .replace('.jpeg', '')
        .replace('.jpg', '')
        .replace('.png', '')
        .trim();
        
    // If it ends up empty, fallback
    if (!baseName) baseName = folder;
    
    if (!groups[baseName]) {
      groups[baseName] = [];
    }
    groups[baseName].push(file);
    
    // Copy file
    fs.copyFileSync(path.join(folderPath, file), path.join(targetFolderPath, file));
  }
  
  const variants = [];
  
  // First, generate the common variants array for this folder
  for (const [baseName, groupFiles] of Object.entries(groups)) {
    groupFiles.sort((a, b) => {
      if (a.toLowerCase().includes('capa')) return -1;
      if (b.toLowerCase().includes('capa')) return 1;
      return 0;
    });
    
    const variantImageUrl = `gifts-grandes/${folder}/${groupFiles[0]}`;
    
    variants.push({
      name: capitalize(baseName),
      image_url: variantImageUrl,
      gallery_urls: groupFiles.map(f => `gifts-grandes/${folder}/${f}`)
    });
  }
  
  if (variants.length === 0) continue;
  
  let displayName = capitalize(folder);
  if (folder.toLowerCase() === 'skz') displayName = 'Stray Kids';
  
  // Second, for EACH variant, create a full product
  for (const [baseName, groupFiles] of Object.entries(groups)) {
    
    groupFiles.sort((a, b) => {
      if (a.toLowerCase().includes('capa')) return -1;
      if (b.toLowerCase().includes('capa')) return 1;
      return 0;
    });
    
    const imageUrl = `gifts-grandes/${folder}/${groupFiles[0]}`;
    const hoverUrl = groupFiles.length > 1 ? `gifts-grandes/${folder}/${groupFiles[1]}` : null;
    const galleryUrls = groupFiles.map(f => `gifts-grandes/${folder}/${f}`);
    
    let prodName = capitalize(baseName);
    if (folder.toLowerCase() === 'skz') {
       prodName = `Stray Kids - ${capitalize(baseName)}`;
    } else if (!prodName.toLowerCase().includes(folder.toLowerCase())) {
       prodName = `${displayName} - ${capitalize(baseName)}`;
    }
    
    // Reorder variants so THIS product's variant is first (selected by default)
    const productVariants = [...variants];
    const selfVariantIdx = productVariants.findIndex(v => v.name === capitalize(baseName));
    if (selfVariantIdx > -1) {
      const selfVrnt = productVariants.splice(selfVariantIdx, 1)[0];
      productVariants.unshift(selfVrnt);
    }
    
    const product = {
      id: `gift-grande-${folder.toLowerCase().replace(/\s+/g, '-')}-${baseName.toLowerCase().replace(/\s+/g, '-')}`,
      aliases: [],
      name: prodName,
      category: "gifts",
      price: 24.9,
      original_price: 29.9,
      image_url: imageUrl,
      hover_image_url: hoverUrl,
      gallery_urls: galleryUrls,
      is_bestseller: false,
      is_new: true,
      is_limited_edition: false,
      product_type: "exclusivo",
      colors: [],
      sizes: ["10x10"],
      material: "Premium",
      dimensions: "10x10",
      variants: productVariants
    };
    
    newProducts.push(product);
  }
}

// Ensure ALL skz variants are at the top of the newProducts array
const skzProducts = newProducts.filter(p => p.id.startsWith('gift-grande-skz-'));
const otherProducts = newProducts.filter(p => !p.id.startsWith('gift-grande-skz-'));
newProducts = [...skzProducts, ...otherProducts];

// 3. Rebuild the file
const finalData = [...newProducts, ...data];

let newArrayStr = '[\n';
for (let i = 0; i < finalData.length; i++) {
  newArrayStr += '  ' + JSON.stringify(finalData[i], null, 2).replace(/\n/g, '\n  ');
  if (i < finalData.length - 1) {
    newArrayStr += ',\n';
  }
}
newArrayStr += '\n]';

content = content.replace(/const productsData = (\[.*\]);?/s, `const productsData = ${newArrayStr};`);
fs.writeFileSync(dataFile, content);
console.log(`Successfully rebuilt products-data.js with ALL variants as products, maintaining variants array.`);

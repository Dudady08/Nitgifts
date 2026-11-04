const fs = require('fs');
const path = require('path');

let content = fs.readFileSync('products-data.js', 'utf8');

const match = content.match(/const productsData = (\[.*\]);?/s);
if (!match) {
    console.error("Could not find productsData array");
    process.exit(1);
}

let data = eval(match[1]);

const canecasDir = 'canecas-site';
const canecasFiles = fs.existsSync(canecasDir) ? fs.readdirSync(canecasDir) : [];

function processItem(item) {
    if (!item.gallery_urls || item.gallery_urls.length === 0) return;

    // For canecas, we might have new 'capa' files that are not in gallery_urls yet.
    if (item.category === 'canecas' || (item.id && item.id.startsWith('can-'))) {
        let baseName = '';
        const firstUrl = item.gallery_urls[0];
        if (firstUrl && firstUrl.includes('canecas-site/')) {
            let filename = firstUrl.split('/').pop();
            
            baseName = filename.replace(/\d+.*$/, '').replace(/(-|branco|verde|azul|preto|rosa|marrom)+$/, '').replace(/\..+$/, '');
            if (!baseName) baseName = filename.replace(/\..+$/, '');
            
            // Special cases
            if (filename.includes('mickey-castelo')) baseName = 'mickey-castelo';
            if (filename.includes('mickey-catelo')) baseName = 'mickey-castelo';
            if (filename.includes('stitich-cabo-rosa')) baseName = 'stitich-cabo-rosa';
            if (filename.includes('stitich-aquarela')) baseName = 'stitich-aquarela';
            if (filename.includes('amizade')) baseName = 'amizade';
            
            const matchingFiles = canecasFiles.filter(f => f.toLowerCase().includes(baseName.toLowerCase()));
            
            matchingFiles.forEach(f => {
                const fullUrl = `canecas-site/${f}`;
                if (!item.gallery_urls.includes(fullUrl)) {
                    item.gallery_urls.push(fullUrl);
                }
            });
        }
    }

    // Keep the original order, just move 'capa' to the front
    const capaUrls = item.gallery_urls.filter(url => url.toLowerCase().includes('capa'));
    const otherUrls = item.gallery_urls.filter(url => !url.toLowerCase().includes('capa'));
    
    // Sort the 'otherUrls' by name to maintain order by number (e.g., 1, 2, 3) 
    // in case they were added out of order
    otherUrls.sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));

    item.gallery_urls = [...capaUrls, ...otherUrls];

    item.image_url = item.gallery_urls[0];
    item.hover_image_url = item.gallery_urls.length > 1 ? item.gallery_urls[1] : item.gallery_urls[0];
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
console.log('Fixed products-data.js order preserving original order with capa at the front');

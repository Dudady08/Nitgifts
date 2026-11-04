const fs = require('fs');
const path = require('path');

let content = fs.readFileSync('products-data.js', 'utf8');

const match = content.match(/const productsData = (\[.*\]);?/s);
if (!match) {
    console.error("Could not find productsData array");
    process.exit(1);
}

let data = eval(match[1]);

// Check PLACAS DE MDF
const mdfDir = 'placas-de-mdf';
if (fs.existsSync(mdfDir)) {
    const files = fs.readdirSync(mdfDir).filter(f => f.match(/\.(jpg|jpeg|png)$/i));
    const groups = {};
    files.forEach(f => {
        let b = f.replace(/ parede\.(jpg|jpeg|png)$/i, '');
        b = b.replace(/\.(jpg|jpeg|png)$/i, '');
        b = b.replace(/-capa|capa/gi, '').trim();
        if (b.endsWith('-')) b = b.slice(0, -1);
        if (!groups[b]) groups[b] = [];
        groups[b].push(f);
    });

    const usedGroups = new Set();
    data.forEach(item => {
        if (item.category === 'placas-mdf' || (item.id && item.id.startsWith('mdf-'))) {
            let b = null;
            if (item.gallery_urls && item.gallery_urls.length > 0) {
                const firstUrl = item.gallery_urls[0].split('/').pop();
                b = firstUrl.replace(/ parede\.(jpg|jpeg|png)$/i, '').replace(/\.(jpg|jpeg|png)$/i, '');
                b = b.replace(/-capa|capa/gi, '').trim();
                if (b.endsWith('-')) b = b.slice(0, -1);
            } else if (item.image_url) {
                const firstUrl = item.image_url.split('/').pop();
                b = firstUrl.replace(/ parede\.(jpg|jpeg|png)$/i, '').replace(/\.(jpg|jpeg|png)$/i, '');
                b = b.replace(/-capa|capa/gi, '').trim();
                if (b.endsWith('-')) b = b.slice(0, -1);
            }
            if (b && groups[b]) {
                usedGroups.add(b);
                item.gallery_urls = groups[b].map(f => `${mdfDir}/${f}`);
                
                // sort capa first if it exists
                const capaUrls = item.gallery_urls.filter(url => url.toLowerCase().includes('capa'));
                const otherUrls = item.gallery_urls.filter(url => !url.toLowerCase().includes('capa'));
                otherUrls.sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));
                item.gallery_urls = [...capaUrls, ...otherUrls];
                
                item.image_url = item.gallery_urls[0];
                item.hover_image_url = item.gallery_urls.length > 1 ? item.gallery_urls[1] : item.gallery_urls[0];
            }
        }
    });

    for (const [b, filesList] of Object.entries(groups)) {
        if (!usedGroups.has(b)) {
            console.log("Adding new MDF product for:", b);
            let gallery = filesList.map(f => `${mdfDir}/${f}`);
            const capaUrls = gallery.filter(url => url.toLowerCase().includes('capa'));
            const otherUrls = gallery.filter(url => !url.toLowerCase().includes('capa'));
            otherUrls.sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));
            gallery = [...capaUrls, ...otherUrls];
            
            const newProduct = {
                id: `mdf-${b.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
                aliases: [],
                name: `Placa MDF ${b.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}`,
                category: "placas-mdf",
                price: 50,
                original_price: null,
                image_url: gallery[0],
                hover_image_url: gallery.length > 1 ? gallery[1] : gallery[0],
                gallery_urls: gallery,
                is_bestseller: false,
                is_new: true,
                is_limited_edition: false,
                product_type: "exclusivo",
                colors: [],
                sizes: ["Único"],
                material: "MDF Premium",
                dimensions: "20x30cm",
                variants: []
            };
            data.unshift(newProduct);
        }
    }
}


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
console.log('Fixed and synced ALL products from all folders successfully');

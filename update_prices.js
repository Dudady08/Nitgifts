const fs = require('fs');
const path = require('path');

let content = fs.readFileSync('products-data.js', 'utf8');

const match = content.match(/const productsData = (\[.*\]);?/s);
if (!match) {
    console.error("Could not find productsData array");
    process.exit(1);
}

let data = eval(match[1]);

// 1. Read all photos in "canecas-site/caneca magica"
const magicDir = path.join('canecas-site', 'caneca magica');
const magicPhotos = fs.existsSync(magicDir)
    ? fs.readdirSync(magicDir)
        .filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f))
        .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }))
        .map(f => `canecas-site/caneca magica/${f}`)
    : [];

console.log('Fotos na pasta caneca magica:', magicPhotos);

// 2. Remove temporarily the Mulher Maravilha and Stitch Boca mugs
// Also merge duplicate can-orixa-caneca-magica into can-orixa-magica (or keep one clean entry with both aliases)
const removedIds = new Set([
    'can-mulher-maravilha',
    'can-mulher-maravilha-magica',
    'can-stitch-boca',
    'can-orixa-caneca-magica'
]);

const removedImagePatterns = [
    'mulher-camavilha-caneca-magica',
    'mulher-maravilha-caneca-magica',
    'stitich-boca-'
];

data = data.filter(product => {
    if (removedIds.has(product.id)) {
        return false;
    }
    const allUrls = [product.image_url, ...(product.gallery_urls || [])].filter(Boolean);
    if (allUrls.some(u => removedImagePatterns.some(pat => u.toLowerCase().includes(pat)))) {
        return false;
    }
    return true;
});

// 3. Process remaining canecas:
// - If images have "caneca-magica": include all photos from "canecas-site/caneca magica" and set price = 55
// - If images have "branco" (or "banco"): set price = 40
// - Otherwise (neither "branco" nor "caneca-magica"): set price = 50
data = data.map(product => {
    if (product.category === 'canecas' || (product.id && product.id.startsWith('can-'))) {
        // Filter out old non-existent "canecas-site/caneca magica/..." URLs first
        let ownUrls = (product.gallery_urls || []).filter(u => !u.toLowerCase().includes('canecas-site/caneca magica/'));
        if (ownUrls.length === 0 && product.image_url) {
            ownUrls = [product.image_url];
        }

        const hasCanecaMagica = ownUrls.some(u => {
            const base = u.split('/').pop().toLowerCase().replace(/\.(jpg|jpeg|png|webp)$/, '');
            return base.includes('caneca-magica');
        });

        const hasBranco = ownUrls.some(u => {
            const base = u.split('/').pop().toLowerCase().replace(/\.(jpg|jpeg|png|webp)$/, '');
            return base.includes('branco') || base.includes('banco');
        });

        if (hasCanecaMagica) {
            // Sort ownUrls with capa first, then numeric order
            const capaUrls = ownUrls.filter(url => url.toLowerCase().includes('capa'));
            const otherOwnUrls = ownUrls.filter(url => !url.toLowerCase().includes('capa'));
            otherOwnUrls.sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));

            product.gallery_urls = [...capaUrls, ...otherOwnUrls, ...magicPhotos];
            product.image_url = product.gallery_urls[0];
            product.hover_image_url = product.gallery_urls.length > 1 ? product.gallery_urls[1] : product.gallery_urls[0];
            product.price = 55;
            product.cabo_tipo = 'magica';
            if (!product.aliases) product.aliases = [];
            if (product.id === 'can-orixa-magica' && !product.aliases.includes('can-orixa-caneca-magica')) {
                product.aliases.push('can-orixa-caneca-magica');
            }
        } else if (hasBranco) {
            product.price = 40;
        } else {
            product.price = 50;
        }

        if (product.variants && product.variants.length > 0) {
            product.variants = product.variants.map(v => {
                v.price = product.price;
                return v;
            });
        }
    }
    return product;
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
console.log('Updated products-data.js successfully!');

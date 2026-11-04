const fs = require('fs');

let content = fs.readFileSync('products-data.js', 'utf8');

const match = content.match(/const productsData = (\[.*\]);?/s);
if (!match) {
    console.error("Could not find productsData array");
    process.exit(1);
}

let data = eval(match[1]);

const canecasDir = 'canecas-site';
const files = fs.readdirSync(canecasDir).filter(f => f.match(/\.(jpg|jpeg|png)$/i));

function getBaseName(filename) {
    let name = filename.toLowerCase();
    
    // Explicit manual overrides to keep grouping solid
    if (name.includes('mickey-castelo') || name.includes('mickey-catelo')) return 'mickey-castelo';
    if (name.includes('stitich-cabo-rosa')) return 'stitich-cabo-rosa';
    if (name.includes('stitich-boca')) return 'stitich-boca';
    if (name.includes('stitich-aquarela')) return 'stitich-aquarela';
    if (name.includes('la-casa-de-papel')) return 'la-casa-de-papel';
    if (name.includes('espirito-santo')) return 'espirito-santo';
    if (name.includes('mulher-camavilha') || name.includes('mulher-maravilha')) return 'mulher-maravilha';
    if (name.includes('orixa-caneca-magica')) return 'orixa-caneca-magica';
    if (name.includes('caneca-magica')) return 'caneca-magica';
    if (name.includes('sao-jorge')) return 'sao-jorge';
    if (name.includes('sem-cafe')) return 'sem-cafe';
    if (name.includes('mickey-cabo-coracao')) return 'mickey-cabo-coracao';
    if (name.includes('mickey-cabo-vermelho')) return 'mickey-cabo-vermelho';
    if (name.includes('fluminense2')) return 'fluminense2';
    if (name.includes('fluminense')) return 'fluminense';
    if (name.includes('flamengo')) return 'flamengo';
    if (name.includes('naruto')) return 'naruto';
    if (name.includes('pokemon')) return 'pokemon';
    if (name.includes('signo')) return 'signo';
    if (name.includes('skz')) return 'skz';
    if (name.includes('star')) return 'star';
    if (name.includes('studio')) return 'studio';
    if (name.includes('iemanja')) return 'iemanja';
    if (name.includes('marvel')) return 'marvel';
    if (name.includes('amizade')) return 'amizade';
    if (name.includes('axe')) return 'axe';
    if (name.includes('dorama')) return 'dorama';
    if (name.includes('nossa-senhora')) return 'nossa-senhora';
    if (name.includes('pinta')) return 'pinta';
    if (name.includes('pintura')) return 'pintura';
    if (name.includes('open-maker-2')) return 'open-maker-2';
    if (name.includes('open-maker')) return 'open-maker';
    if (name.includes('openmaker')) return 'openmaker';
    
    // generic fallback
    name = name.replace('-capa', '').replace('capa', '');
    name = name.replace(/\.(jpg|jpeg|png)$/, '');
    name = name.replace(/-\d+.*$/, ''); 
    name = name.replace(/\d+.*$/, ''); 
    name = name.replace(/-branco|-verde|-azul|-preto|-rosa|-marrom/g, '');
    name = name.replace(/branco|verde|azul|preto|rosa|marrom/g, '');
    if (name.endsWith('-')) name = name.slice(0, -1);
    
    return name;
}

// Group all files by baseName
const groups = {};
files.forEach(f => {
    const b = getBaseName(f);
    if (!groups[b]) groups[b] = [];
    groups[b].push(f);
});

// For each existing caneca, update its gallery_urls
const usedGroups = new Set();

data.forEach(item => {
    if (item.category === 'canecas' || (item.id && item.id.startsWith('can-'))) {
        let b = null;
        if (item.gallery_urls && item.gallery_urls.length > 0) {
            const firstUrl = item.gallery_urls[0].split('/').pop();
            b = getBaseName(firstUrl);
        } else if (item.id) {
            b = item.id.replace('can-', '');
        }

        if (b && groups[b]) {
            usedGroups.add(b);
            item.gallery_urls = groups[b].map(f => `canecas-site/${f}`);
            
            // Append magic mug effect images if it's a magic mug
            if (b.includes('caneca-magica')) {
                try {
                    const magicFiles = fs.readdirSync('canecas-site/caneca magica').filter(f => f.match(/\.(jpg|jpeg|png)$/i));
                    magicFiles.forEach(f => {
                        item.gallery_urls.push(`canecas-site/caneca magica/${f}`);
                    });
                } catch (e) {
                    console.error("No caneca magica folder found");
                }
            }
            
            // Sort to maintain original sequence, but 'capa' first
            const capaUrls = item.gallery_urls.filter(url => url.toLowerCase().includes('capa'));
            const otherUrls = item.gallery_urls.filter(url => !url.toLowerCase().includes('capa'));
            otherUrls.sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));
            
            item.gallery_urls = [...capaUrls, ...otherUrls];
            item.image_url = item.gallery_urls[0];
            item.hover_image_url = item.gallery_urls.length > 1 ? item.gallery_urls[1] : item.gallery_urls[0];
        }
    }
});

// Create new products for unused groups
for (const [b, filesList] of Object.entries(groups)) {
    if (!usedGroups.has(b)) {
        console.log("Adding new product for:", b);
        let gallery = filesList.map(f => `canecas-site/${f}`);
        
        if (b.includes('caneca-magica')) {
            try {
                const magicFiles = fs.readdirSync('canecas-site/caneca magica').filter(f => f.match(/\.(jpg|jpeg|png)$/i));
                magicFiles.forEach(f => {
                    gallery.push(`canecas-site/caneca magica/${f}`);
                });
            } catch (e) {
                console.error("No caneca magica folder found");
            }
        }
        
        const capaUrls = gallery.filter(url => url.toLowerCase().includes('capa'));
        const otherUrls = gallery.filter(url => !url.toLowerCase().includes('capa'));
        otherUrls.sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));
        gallery = [...capaUrls, ...otherUrls];
        
        const newProduct = {
            id: `can-${b}`,
            aliases: [],
            name: `Caneca ${b.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}`,
            category: "canecas",
            price: 80,
            original_price: null,
            image_url: gallery[0],
            hover_image_url: gallery.length > 1 ? gallery[1] : gallery[0],
            gallery_urls: gallery,
            is_bestseller: false,
            is_new: true,
            is_limited_edition: false,
            product_type: "exclusivo",
            colors: [],
            sizes: ["325ml"],
            material: "Cerâmica Premium",
            dimensions: "9.5cm x 8cm",
            variants: []
        };
        data.unshift(newProduct);
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
console.log('Fixed and synced all canecas from canecas-site successfully');

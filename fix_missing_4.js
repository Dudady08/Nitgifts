const fs = require('fs');

let content = fs.readFileSync('products-data.js', 'utf8');
eval(content.replace('const mockProducts =', 'global.mockProducts ='));

const files = fs.readdirSync('canecas site').map(f => f.toLowerCase());
const realFilesDict = {};
fs.readdirSync('canecas site').forEach(f => {
  // Windows normalization to handle accents
  realFilesDict[f.toLowerCase()] = f;
});

function getImagesForProduct(id) {
  const map = {
    'can-mickey-cabo-coracao': 'mickey cabo cora',
    'can-sem-cafe': 'sem caf',
    'can-sao-jorge': 'jorge',
    'can-orixa-magica': 'orix'
  };
  
  const prefix = map[id];
  if (!prefix) return null;
  
  const matched = files.filter(f => f.includes(prefix));
  if (matched.length === 0) return null;
  
  matched.sort((a, b) => a.localeCompare(b));
  
  // primary logic
  let primary = matched.find(f => !f.match(/\d/)) || matched.find(f => f.includes(' 1')) || matched[0];
  let hover = matched.find(f => f.includes('2')) || matched[1] || primary;
  
  return {
    image_url: 'canecas site/' + realFilesDict[primary],
    hover_image_url: 'canecas site/' + realFilesDict[hover],
    gallery_urls: matched.map(f => 'canecas site/' + realFilesDict[f])
  };
}

global.mockProducts.forEach(p => {
  if (p.category === 'canecas') {
    const imgs = getImagesForProduct(p.id);
    if (imgs) {
      p.image_url = imgs.image_url;
      p.hover_image_url = imgs.hover_image_url;
      p.gallery_urls = imgs.gallery_urls;
    }
  }
});

const newContent = content.replace(/const mockProducts = \[[\s\S]*?\];/, 'const mockProducts = ' + JSON.stringify(global.mockProducts, null, 2) + ';');
fs.writeFileSync('products-data.js', newContent, 'utf8');
console.log('Fixed missing 4 images!');

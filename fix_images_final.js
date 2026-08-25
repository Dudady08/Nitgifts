const fs = require('fs');

let content = fs.readFileSync('products-data.js', 'utf8');
eval(content.replace('const mockProducts =', 'global.mockProducts ='));

const files = fs.readdirSync('canecas site').map(f => f.toLowerCase());
const realFilesDict = {};
fs.readdirSync('canecas site').forEach(f => {
  realFilesDict[f.toLowerCase()] = f;
});

// Helper to find matches based on keywords
function getImagesForProduct(id) {
  const map = {
    'can-stitch-cabo-rosa': 'stitich cabo rosa',
    'can-mickey-cabo-coracao': 'mickey cabo cora��o',
    'can-amizade': 'amizade',
    'can-axe': 'axe',
    'can-dorama': 'dorama',
    'can-iemanja': 'iemanja',
    'can-la-casa-de-papel': 'la casa de papel',
    'can-mickey-cabo-vermelho': 'mickey cabo vermelho',
    'can-mickey-castelo': 'mickey castelo',
    'can-naruto': 'naruto',
    'can-nossa-senhora': 'nossa senhora',
    'can-pinta': 'pinta',
    'can-pintura': 'pintura',
    'can-signo': 'signo',
    'can-skz': 'skz',
    'can-sophia': 'sophia',
    'can-studio': 'studio',
    'can-star': 'star',
    'can-stitch-boca': 'stitich boca',
    'can-espirito-santo': 'espirito santo',
    'can-marvel': 'marvel',
    'can-planeta': 'planeta',
    'can-pokemon': 'pokemon',
    'can-sem-cafe': 'sem caf�',
    'can-sao-jorge': 's�o jorge',
    'can-mulher-maravilha-magica': 'mulher maravilha',
    'can-orixa-magica': 'orix�',
    'can-magica-personalizada': 'caneca magica'
  };
  
  const prefix = map[id];
  if (!prefix) return [];
  
  // special cases because of weird file naming
  let matched = [];
  if (id === 'can-mickey-castelo') {
    matched = files.filter(f => f.includes('mickey castelo') || f.includes('mickey catelo'));
  } else if (id === 'can-pinta') {
    matched = files.filter(f => f.startsWith('pinta') && !f.includes('pintura'));
  } else if (id === 'can-magica-personalizada') {
    matched = files.filter(f => f.startsWith('caneca magica'));
  } else {
    matched = files.filter(f => f.includes(prefix));
  }
  
  // Sort them so that '1' or base name comes first
  matched.sort((a, b) => a.localeCompare(b));
  
  // We want the primary image to be the one without numbers, or '1'
  let primary = matched.find(f => !f.match(/\d/)) || matched.find(f => f.includes(' 1')) || matched[0];
  if (id === 'can-mickey-cabo-vermelho') primary = matched.find(f => f.includes(' 1'));
  if (id === 'can-stitch-cabo-rosa') primary = matched.find(f => f.includes(' 1'));
  if (id === 'can-stitch-boca') primary = matched.find(f => f.includes(' 1'));
  if (id === 'can-naruto') primary = matched.find(f => f.includes(' 1'));
  if (id === 'can-signo') primary = matched.find(f => f.includes(' 1'));
  if (id === 'can-espirito-santo') primary = matched.find(f => !f.match(/\d/));
  
  let hover = matched.find(f => f.includes('2')) || matched[1];
  if (!hover) hover = primary;
  
  return {
    image_url: 'canecas site/' + realFilesDict[primary],
    hover_image_url: 'canecas site/' + realFilesDict[hover],
    gallery_urls: matched.map(f => 'canecas site/' + realFilesDict[f])
  };
}

global.mockProducts.forEach(p => {
  if (p.category === 'canecas') {
    const imgs = getImagesForProduct(p.id);
    if (imgs.image_url) {
      p.image_url = imgs.image_url;
      p.hover_image_url = imgs.hover_image_url;
      p.gallery_urls = imgs.gallery_urls;
    }
  }
});

const newContent = content.replace(/const mockProducts = \[[\s\S]*?\];/, 'const mockProducts = ' + JSON.stringify(global.mockProducts, null, 2) + ';');
fs.writeFileSync('products-data.js', newContent, 'utf8');
console.log('Fixed ALL images deterministically!');

const fs = require('fs');

let content = fs.readFileSync('products-data.js', 'utf8');

// 1. Update cabo_tipo logic
content = content.replace(/cabo_tipo:\s*"([^"]+)"/g, (match, p1) => {
  if (p1 !== 'magica' && p1 !== 'coracao') {
    return 'cabo_tipo: "colorida"';
  }
  return match;
});

// Edge case for specific files we saw failing:
const manualReplacements = {
  '"canecas-site/naruto-1.jpg"': '"canecas-site/naruto-1-cabo-laranja.jpg"',
  '"canecas-site/naruto-2.jpg"': '"canecas-site/naruto-2-cabo-laranja.jpg"',
  '"canecas-site/naruto-3.jpg"': '"canecas-site/naruto-3-cabo-laranja.jpg"',
  '"canecas-site/naruto-4.jpg"': '"canecas-site/naruto-4-cabo-laranja.jpg"',
  '"canecas-site/naruto-6.jpg"': '"canecas-site/naruto-6-cabo-laranja.jpg"',
  '"canecas-site/naruto-7.jpg"': '"canecas-site/naruto-7-cabo-laranja.jpg"',
  '"canecas-site/pintura.jpg"': '"canecas-site/pintura-cabo-marrom.jpg"',
  '"canecas-site/pintura-2.jpg"': '"canecas-site/pintura-2-cabo-marrom.jpg"',
  '"canecas-site/pintura-3.jpg"': '"canecas-site/pintura-3-cabo-marrom.jpg"',
  '"canecas-site/pintura-4.jpg"': '"canecas-site/pintura-4-cabo-marrom.jpg"',
  '"canecas-site/pintura-5.jpg"': '"canecas-site/pintura-5-cabo-marrom.jpg"',
  '"canecas-site/signo-1.jpg"': '"canecas-site/signo-1-cabo-preto.jpg"',
  '"canecas-site/signo-2.jpg"': '"canecas-site/signo-2-cabo-preto.jpg"',
  '"canecas-site/signo-4.jpg"': '"canecas-site/signo-4-cabo-preto.jpg"',
  '"canecas-site/signo-7.jpg"': '"canecas-site/signo-7-cabo-preto.jpg"',
  '"canecas-site/signo-9.jpg"': '"canecas-site/signo-9-cabo-preto.jpg"',
  '"canecas-site/star.jpg"': '"canecas-site/star-cabo-preto.jpg"',
  '"canecas-site/star-2.jpg"': '"canecas-site/star-2-cabo-preto.jpg"',
  '"canecas-site/star-3.jpg"': '"canecas-site/star-3-cabo-preto.jpg"',
  '"canecas-site/star-4.jpg"': '"canecas-site/star-4-cabo-preto.jpg"',
  '"canecas-site/star-6.jpg"': '"canecas-site/star-6-cabo-preto.jpg"',
  '"canecas-site/espirito-santo.jpg"': '"canecas-site/espirito-santo-cabo-azul.jpg"',
  '"canecas-site/espirito-santo-2.jpg"': '"canecas-site/espirito-santo-2-cabo-azul.jpg"',
  '"canecas-site/espirito-santo-3.jpg"': '"canecas-site/espirito-santo-3-cabo-azul.jpg"',
  '"canecas-site/espirito-santo-4.jpg"': '"canecas-site/espirito-santo-4-cabo-azul.jpg"',
  '"canecas-site/espirito-santo-5.jpg"': '"canecas-site/espirito-santo-5-cabo-azul.jpg"',
  '"canecas-site/marvel.jpg"': '"canecas-site/marvel-cabo-verde.jpg"',
  '"canecas-site/marvel-2.jpg"': '"canecas-site/marvel-2-cabo-verde.jpg"',
  '"canecas-site/marvel-3.jpg"': '"canecas-site/marvel-3-cabo-verde.jpg"',
  '"canecas-site/marvel-4.jpg"': '"canecas-site/marvel-4-cabo-verde.jpg"',
  '"canecas-site/marvel-5.jpg"': '"canecas-site/marvel-5-cabo-verde.jpg"',
  '"canecas-site/são-jorge.jpg"': '"canecas-site/são-jorge-cabo-verde.jpg"',
  '"canecas-site/são-jorge-2.jpg"': '"canecas-site/são-jorge-2-cabo-verde.jpg"',
  '"canecas-site/são-jorge-3.jpg"': '"canecas-site/são-jorge-3-cabo-verde.jpg"',
  '"canecas-site/são-jorge-4.jpg"': '"canecas-site/são-jorge-4-cabo-verde.jpg"',
  '"canecas-site/são-jorge-5.jpg"': '"canecas-site/são-jorge-5-cabo-verde.jpg"',
  '"canecas-site/são-jorge-6.jpg"': '"canecas-site/são-jorge-6-cabo-verde.jpg"'
};

for (const [bad, good] of Object.entries(manualReplacements)) {
  const regex = new RegExp(bad.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
  content = content.replace(regex, good);
}

fs.writeFileSync('products-data.js', content, 'utf8');
console.log('Fixed products-data.js');

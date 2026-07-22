const fs = require('fs');
let content = fs.readFileSync('products-data.js', 'utf8');

const colorUpdates = {
  'can-mickey-cabo-coracao': '"Vermelho"',
  'can-mulher-maravilha-magica': '"Preto"',
  'can-orixa-magica': '"Preto"',
  'can-magica-personalizada': '"Preto"',
  'can-naruto': '"Laranja"',
  'can-pintura': '"Marrom"',
  'can-signo': '"Preto"',
  'can-star': '"Preto"',
  'can-espirito-santo': '"Azul"',
  'can-marvel': '"Verde"',
  'can-sao-jorge': '"Verde"'
};

for (const [id, color] of Object.entries(colorUpdates)) {
  const regex = new RegExp('(id:\\s*"' + id + '"[\\s\\S]*?colors:\\s*\\[\\s*)("[^"]+")(\\s*\\])', 'm');
  content = content.replace(regex, `$1${color}$3`);
}

fs.writeFileSync('products-data.js', content, 'utf8');
console.log('Fixed colors array in products-data.js');

const fs = require('fs');

// 1. Update styles.css
let css = fs.readFileSync('styles.css', 'utf8');

// We find blocks that have background-color: var(--color-primary) and color: var(--color-white)
// and change the color to var(--color-dark)
const regex = /(background-color:\s*var\(--color-primary\);[^}]*?color:\s*)var\(--color-white\);/gs;
css = css.replace(regex, '(--color-dark);');

fs.writeFileSync('styles.css', css, 'utf8');

// 2. Update layout.js footer
let layout = fs.readFileSync('layout.js', 'utf8');
layout = layout.replace('color: var(--color-white);', 'color: var(--color-dark);');
// Fix text-white-70 to just standard color or opacity
layout = layout.replace('text-white-70', 'opacity-80');
layout = layout.replace('color: rgba(255, 255, 255, 0.7);', 'color: rgba(0, 0, 0, 0.8);');
layout = layout.replace('border-white/20', 'border-black/20');
layout = layout.replace('border-top: 1px solid rgba(255, 255, 255, 0.2);', 'border-top: 1px solid rgba(0, 0, 0, 0.2);');
layout = layout.replace('border-bottom: 1px solid rgba(255, 255, 255, 0.2);', 'border-bottom: 1px solid rgba(0, 0, 0, 0.2);');
layout = layout.replace('color: rgba(255, 255, 255, 0.5);', 'color: rgba(0, 0, 0, 0.6);');

fs.writeFileSync('layout.js', layout, 'utf8');

console.log('Fixed text colors on gold backgrounds.');

const fs = require('fs');

const files = fs.readdirSync('.').filter(f => f.endsWith('.html') || f.endsWith('.js') || f.endsWith('.css'));

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // Color replacements
  content = content.replace(/#D4AF37/gi, '#D4AF37');
  
  // Text replacements
  content = content.replace(//g, '');
  content = content.replace(//g, '');
  content = content.replace(//g, '');
  content = content.replace(//g, '');
  content = content.replace(//g, '');
  content = content.replace(//g, '');
  content = content.replace(//g, '');
  content = content.replace(//g, '');
  
  // Some minor cleanup if double spaces appear
  content = content.replace(/ /g, ' ');

  if (file === 'layout.js') {
    // Remove vestuário premium
    content = content.replace(/vestuário premium, /gi, '');
    // Instagram link
    content = content.replace(/instagram\.com\/nitgift\b/gi, 'instagram.com/nitgifts/');
  }
  
  if (file === 'index.html') {
    // Fix the hero titles that might have become empty or weird
    content = content.replace(/que<br>contam histórias/g, 'Histórias<br>Genuínas'); // Assuming got removed
    // Actually, the original was "que contam histórias". I'll just change the whole text to avoid weirdness
    content = content.replace(/<h1 class="hero-title">que<br>contam histórias<\/h1>/g, '<h1 class="hero-title">Presentes que<br>marcam</h1>');
  }

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated string/color in ${file}`);
  }
});

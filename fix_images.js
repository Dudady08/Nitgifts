const fs = require('fs');

let content = fs.readFileSync('products-data.js', 'utf8');

const files = fs.readdirSync('canecas site').map(f => f.toLowerCase());
const realFilesDict = {};
fs.readdirSync('canecas site').forEach(f => {
  realFilesDict[f.toLowerCase()] = f;
});

// For each caneca image, if it's not found, we find the closest match.
// Let's parse out the canecas objects first.
let missingMatches = [];
content = content.replace(/"canecas site\/([^"]+\.jpg)"/gi, (match, p1) => {
  const lowerP1 = p1.toLowerCase();
  
  // Check if it exists exactly (case-insensitive)
  if (realFilesDict[lowerP1]) {
    return "canecas site/";
  }

  // It does NOT exist. We need to find the file that contains the prefix.
  const prefix = lowerP1.replace(/\.jpg$/, '').trim();
  
  // Sometimes the prefix is just "amizade", but the file is "amizade (branco).jpg"
  // So we search for files that start with the prefix, ignoring spaces or looking for exact sub-matches
  const basePrefix = prefix.replace(/\d+$/, '').trim(); // e.g. "amizade"
  
  // Try to find a file that includes the basePrefix and any number
  const numMatch = prefix.match(/\d+$/);
  const num = numMatch ? numMatch[0] : null;

  let bestMatch = files.find(f => {
    if (!f.includes(basePrefix)) return false;
    if (num && !f.includes(num)) return false;
    if (!num && f.match(/\d/)) return false; // if no num in prefix, try to avoid files with numbers
    return true;
  });

  if (bestMatch) {
    missingMatches.push({ bad: match, good: "canecas site/"});
    return "canecas site/";
  }

  // specific manual fallback
  if (lowerP1 === 'studio 2 .jpg') bestMatch = 'studio 2 (branco).jpg';
  if (lowerP1 === 'mickey castelo 1.jpg') bestMatch = 'mickey castelo 1(branco).jpg';
  // etc.. let's just use a loose fuzzy
  bestMatch = files.find(f => f.replace(/[^a-z0-9]/g, '').includes(prefix.replace(/[^a-z0-9]/g, '')));
  if (bestMatch) {
    missingMatches.push({ bad: match, good: "canecas site/", fuzzy: true });
    return "canecas site/";
  }

  return match;
});

fs.writeFileSync('products-data.js', content, 'utf8');
console.log('Fixed images: ', JSON.stringify(missingMatches, null, 2));

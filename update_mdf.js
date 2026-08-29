const fs = require('fs');

const dataFile = 'c:\\Users\\eduar\\Downloads\\Nitgifts-main\\products-data.js';
let content = fs.readFileSync(dataFile, 'utf8');
const match = content.match(/const productsData = (\[.*\]);?/s);

if (match) {
  let data = eval(match[1]);
  
  for (let p of data) {
    if (p.category === 'placas-mdf') {
       let baseNameMatch = p.image_url.match(/placas-de-mdf\/(.*?)\.(jpg|png|jpeg)/);
       if (baseNameMatch) {
         let baseName = baseNameMatch[1];
         let mainImg = `placas-de-mdf/${baseName}.jpeg`;
         let paredeImg = `placas-de-mdf/${baseName} parede.jpeg`;
         
         p.image_url = mainImg;
         p.hover_image_url = paredeImg;
         p.gallery_urls = [mainImg, paredeImg];
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
  fs.writeFileSync(dataFile, content);
  console.log("Successfully updated placas MDF images");
}

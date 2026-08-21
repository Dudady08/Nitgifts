const fs = require('fs');

const dataFile = 'products-data.js';
let content = fs.readFileSync(dataFile, 'utf8');

let start = content.indexOf('[');
let end = content.lastIndexOf(']');
let jsonArray = content.substring(start, end + 1);
let arr;
try {
    arr = eval(jsonArray);
} catch (e) {
    console.log("Error parsing", e);
}

if (arr) {
    const updatedProducts = arr.filter(p => p.id !== 'mdf-3');
    updatedProducts.forEach(p => {
        if (p.category === 'canecas') {
            p.material = 'Cerâmica Importada';
        }
    });

    const newContent = 'const productsData = ' + JSON.stringify(updatedProducts, null, 1) + ';\n';
    fs.writeFileSync(dataFile, newContent, 'utf8');
    console.log("Success");
} else {
    console.log("Failed to parse array.");
}

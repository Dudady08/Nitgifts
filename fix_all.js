const fs = require('fs');
const path = require('path');

function slugify(text) {
    return text.toString().toLowerCase()
        .replace(/\s+/g, '-')           // Replace spaces with -
        .replace(/%20/g, '-')           // Replace %20 with -
        .replace(/[^\w\-]+/g, '')       // Remove all non-word chars except hyphen (wait, what about extension?)
        .replace(/\-\-+/g, '-')         // Replace multiple - with single -
        .replace(/^-+/, '')             // Trim - from start of text
        .replace(/-+$/, '');            // Trim - from end of text
}

function cleanFilename(filename) {
    const ext = path.extname(filename).toLowerCase();
    const name = path.basename(filename, path.extname(filename));
    
    // special handling: just replace spaces with hyphens and lowercase
    let newName = name.toLowerCase().replace(/[\s%20]+/g, '-').replace(/\-\-+/g, '-');
    return newName + ext;
}

const dirsToRename = {
    'canecas site': 'canecas-site',
    'Placas de MDF': 'placas-de-mdf'
};

const mapOldToNew = {}; // store mapping for file contents replacement

for (const [oldDir, newDir] of Object.entries(dirsToRename)) {
    if (fs.existsSync(oldDir)) {
        console.log(`Renaming folder: "${oldDir}" -> "${newDir}"`);
        fs.renameSync(oldDir, newDir);
    }
    
    // Now process files in the new dir
    if (fs.existsSync(newDir)) {
        const files = fs.readdirSync(newDir);
        for (const file of files) {
            const oldFilePath = path.join(newDir, file);
            const stats = fs.statSync(oldFilePath);
            if (stats.isFile()) {
                const newFilename = cleanFilename(file);
                if (newFilename !== file) {
                    const newFilePath = path.join(newDir, newFilename);
                    fs.renameSync(oldFilePath, newFilePath);
                    console.log(`Renamed file: "${file}" -> "${newFilename}"`);
                }
                
                // Keep track of the old full path mapping (olddir/oldfile -> newdir/newfile)
                // We need to account for what might be in products-data.js
                // products-data.js might have: "canecas site/Stitich cabo rosa 1 .jpg"
                const oldUrlPath = `${oldDir}/${file}`;
                const newUrlPath = `${newDir}/${newFilename}`;
                mapOldToNew[oldUrlPath.toLowerCase()] = newUrlPath;
            }
        }
    }
}

// Now replace in products-data.js and other files
const filesToProcess = ['products-data.js', 'index.html']; // You can add more if needed
for (const rootFile of fs.readdirSync('.')) {
    if ((rootFile.endsWith('.html') || rootFile.endsWith('.js')) && rootFile !== 'fix_all.js') {
        let content = fs.readFileSync(rootFile, 'utf8');
        let originalContent = content;
        
        // Strategy: We will replace occurrences of 'canecas site/...' and 'Placas de MDF/...' 
        // with their lowercased, hyphenated versions.
        
        // Replace folder names first in case there are partial matches, but wait,
        // it's safer to use the exact mapping for full paths.
        
        // Find all strings like "canecas site/something.jpg" or 'canecas site/...'
        const regex = /(canecas site|Placas de MDF)\/([^"'\\]+)/gi;
        content = content.replace(regex, (match, dir, file) => {
            const oldPathLower = match.toLowerCase();
            if (mapOldToNew[oldPathLower]) {
                return mapOldToNew[oldPathLower];
            } else {
                // If it wasn't strictly found in the mapping, try to clean it manually
                const cleanDir = dir.toLowerCase() === 'canecas site' ? 'canecas-site' : 'placas-de-mdf';
                return `${cleanDir}/${cleanFilename(file)}`;
            }
        });

        if (content !== originalContent) {
            fs.writeFileSync(rootFile, content, 'utf8');
            console.log(`Updated paths in ${rootFile}`);
        }
    }
}

console.log("Fix completed successfully.");

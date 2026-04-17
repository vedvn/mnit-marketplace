const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else {
            if (file.endsWith('.tsx') || file.endsWith('.ts')) {
                results.push(file);
            }
        }
    });
    return results;
}

const files = walk(path.join(__dirname, 'src'));
let totalChanged = 0;

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    const originalContent = content;
    
    // Replace border-white/* with border-black/*
    content = content.replace(/border-white\/5/g, 'border-black/5');
    content = content.replace(/border-white\/10/g, 'border-black/10');
    content = content.replace(/border-white\/20/g, 'border-black/20');
    
    // Also fix shadow if it's too bright for light mode? Shadow is fine.

    if (content !== originalContent) {
        fs.writeFileSync(file, content, 'utf8');
        totalChanged++;
        console.log(`Updated ${file}`);
    }
});

console.log(`Replaced properties in ${totalChanged} files.`);

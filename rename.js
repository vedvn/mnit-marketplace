const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  for (const file of fs.readdirSync(dir)) {
    const full = path.join(dir, file);
    if (fs.statSync(full).isDirectory()) {
      results = results.concat(walk(full));
    } else if (/\.(tsx?|js|css)$/.test(file)) {
      results.push(full);
    }
  }
  return results;
}

let changed = 0;
for (const file of walk(path.join(__dirname, 'src'))) {
  const original = fs.readFileSync(file, 'utf8');
  // Replace all variants
  const updated = original
    .replace(/MNIT Resell Platform/g, 'MNIT Marketplace')
    .replace(/MNIT Resell marketplace/g, 'MNIT Marketplace')
    .replace(/MNIT Reseller marketplace/g, 'MNIT Marketplace')
    .replace(/MNIT Reseller/g, 'MNIT Marketplace')
    .replace(/MNIT Resell/g, 'MNIT Marketplace');

  if (updated !== original) {
    fs.writeFileSync(file, updated, 'utf8');
    console.log('Updated:', file);
    changed++;
  }
}
console.log(`Done. ${changed} files updated.`);

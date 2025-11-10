const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'seedCuratedOutfits.js');
let content = fs.readFileSync(filePath, 'utf8');

// Replace all placeholder.com URLs with picsum.photos (more reliable)
content = content.replace(/https:\/\/via\.placeholder\.com\/400x600[^'"]*/g, 'https://picsum.photos/400/600?random=1');
content = content.replace(/https:\/\/via\.placeholder\.com\/200[^'"]*/g, 'https://picsum.photos/200/200?random=2');

fs.writeFileSync(filePath, content, 'utf8');
console.log('✓ Updated image URLs to use picsum.photos');

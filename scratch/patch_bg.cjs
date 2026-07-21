const fs = require('fs');

['src/main.ts', 'src/journal.ts', 'src/engine-page.ts'].forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(/bg-\[#0B0F19\]/g, 'bg-transparent');
    fs.writeFileSync(file, content);
});

console.log('Patched backgrounds!');

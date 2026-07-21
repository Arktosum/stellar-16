const fs = require('fs');

['src/alu-page.ts', 'src/stars.ts'].forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(/\\`/g, '`');
    content = content.replace(/\\\$\{/g, '${');
    fs.writeFileSync(file, content);
});

console.log('Fixed syntax errors!');

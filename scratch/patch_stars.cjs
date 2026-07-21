const fs = require('fs');

['src/main.ts', 'src/journal.ts', 'src/engine-page.ts'].forEach(f => {
    let content = fs.readFileSync(f, 'utf8');
    if (!content.includes("import './stars';")) {
        content = "import './stars';\n" + content;
        fs.writeFileSync(f, content);
    }
});
console.log('Imported stars!');

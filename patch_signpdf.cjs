const fs = require('fs');
const path = 'node_modules/@signpdf/utils/dist/removeTrailingNewLine.js';
let content = fs.readFileSync(path, 'utf8');
content = content.replace(
    'const removeTrailingNewLine = pdf => {',
    'const removeTrailingNewLine = pdf => { console.log("DEBUG: pdf constructor:", pdf.constructor.name); console.log("DEBUG: global Buffer:", Buffer.name); console.log("DEBUG: pdf instanceof Buffer:", pdf instanceof Buffer);'
);
fs.writeFileSync(path, content);
console.log('Patched removeTrailingNewLine.js');

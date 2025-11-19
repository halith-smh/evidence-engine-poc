const { plainAddPlaceholder } = require('@signpdf/placeholder-plain');
// const { Buffer } = require('buffer'); // Use global Buffer

console.log('--- Debugging plainAddPlaceholder CJS ---');

const pdfBuffer = Buffer.from('%PDF-1.7\nSome content\n%%EOF');
console.log('Is Buffer:', Buffer.isBuffer(pdfBuffer));
console.log('Instance:', pdfBuffer instanceof Buffer);

try {
    const result = plainAddPlaceholder(pdfBuffer, {
        reason: 'Test',
        contactInfo: 'test@test.com',
        name: 'Test',
        location: 'Test',
    });
    console.log('Success! Result length:', result.length);
} catch (e) {
    console.error('Error caught:', e);
}

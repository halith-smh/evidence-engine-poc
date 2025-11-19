import { Connection } from '@solana/web3.js';
import { plainAddPlaceholder } from '@signpdf/placeholder-plain';

console.log('--- Debugging plainAddPlaceholder with Solana import ---');

const pdfBuffer = Buffer.from('%PDF-1.7\nSome content\n%%EOF');
console.log('Is Buffer (static):', Buffer.isBuffer(pdfBuffer));
console.log('Instance of Buffer:', pdfBuffer instanceof Buffer);
console.log('Buffer constructor name:', pdfBuffer.constructor.name);

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

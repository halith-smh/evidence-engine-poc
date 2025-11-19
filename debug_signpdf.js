import { plainAddPlaceholder } from '@signpdf/placeholder-plain';
import { Buffer } from 'buffer';

console.log('--- Debugging plainAddPlaceholder ---');

const pdfBuffer = Buffer.from('%PDF-1.7\nSome content\n%%EOF');
console.log('Is Buffer:', Buffer.isBuffer(pdfBuffer));
console.log('Buffer constructor:', pdfBuffer.constructor.name);

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

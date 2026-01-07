import fs from 'fs';

// Minimal 1x1 transparent PNG (base64)
const minimalPNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  'base64'
);

fs.writeFileSync('public/icon-192.png', minimalPNG);
fs.writeFileSync('public/icon-512.png', minimalPNG);

console.log('✅ Placeholder icons created!');
console.log('');
console.log('📝 Next steps:');
console.log('   1. Open public/generate-icons.html in your browser');
console.log('   2. Click the download buttons to get proper icons');
console.log('   3. Move the downloaded files to the public/ folder');
console.log('');
console.log('Or use any icon generator online to create:');
console.log('   - public/icon-192.png (192x192)');
console.log('   - public/icon-512.png (512x512)');

import sharp from 'sharp';

async function generateIcons() {
  await sharp('public/icon.svg')
    .resize(192, 192)
    .toFile('public/icon-192.png');
    
  await sharp('public/icon.svg')
    .resize(512, 512)
    .toFile('public/icon-512.png');
    
  console.log('Icons generated successfully!');
}

generateIcons();

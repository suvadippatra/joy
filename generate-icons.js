import sharp from 'sharp';
import fs from 'fs';

const svgBuffer = fs.readFileSync('./public/icon.svg');

async function generate() {
  await sharp(svgBuffer).resize(192, 192).png().toFile('./public/pwa-192x192.png');
  await sharp(svgBuffer).resize(512, 512).png().toFile('./public/pwa-512x512.png');
  // Maskable needs padding
  await sharp({
    create: { width: 512, height: 512, channels: 4, background: { r: 37, g: 99, b: 235, alpha: 1 } }
  }).composite([{ input: svgBuffer, blend: 'over' }]).png().toFile('./public/pwa-maskable-512x512.png');
  await sharp(svgBuffer).resize(180, 180).png().toFile('./public/apple-touch-icon.png');
  console.log('Icons generated successfully.');
}
generate();

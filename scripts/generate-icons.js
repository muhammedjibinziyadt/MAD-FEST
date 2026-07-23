/**
 * Icon Generator Script
 * 
 * This script generates PWA icons from a source image.
 * Place your source logo/icon as public/icon-source.png (or .jpg, .webp)
 * and run: node scripts/generate-icons.js
 * 
 * Requires: sharp package (npm install sharp --save-dev)
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const sourceImage = path.join(__dirname, '../public/img/assets/logo-new.png');
const outputDir = path.join(__dirname, '../public');
const appDir = path.join(__dirname, '../src/app');

async function generateIcons() {
  try {
    if (!fs.existsSync(sourceImage)) {
      console.error(`Source image not found: ${sourceImage}`);
      return;
    }

    console.log('Generating PWA icons and favicons from logo-new.png...');

    for (const size of sizes) {
      const outputPath = path.join(outputDir, `icon-${size}x${size}.png`);

      await sharp(sourceImage)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 }
        })
        .png()
        .toFile(outputPath);

      console.log(`✓ Generated icon-${size}x${size}.png`);
    }

    // Generate apple-touch-icon (180x180)
    await sharp(sourceImage)
      .resize(180, 180, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .png()
      .toFile(path.join(outputDir, 'apple-touch-icon.png'));

    // Generate src/app/icon.png (32x32 and 48x48)
    await sharp(sourceImage)
      .resize(48, 48, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .png()
      .toFile(path.join(appDir, 'icon.png'));

    // Generate favicon.ico in src/app and public/
    await sharp(sourceImage)
      .resize(32, 32, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .toFormat('png')
      .toFile(path.join(appDir, 'favicon.ico'));

    await sharp(sourceImage)
      .resize(32, 32, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .toFormat('png')
      .toFile(path.join(outputDir, 'favicon.ico'));

    console.log('✓ Generated app favicons');
    console.log('\n✅ All icons and favicons generated successfully!');
  } catch (error) {
    console.error('Error generating icons:', error);
  }
}

generateIcons();


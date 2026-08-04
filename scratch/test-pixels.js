const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const brainDir = 'C:\\Users\\HP\\.gemini\\antigravity-ide\\brain\\9399bece-fefc-409e-bfdf-9095e530f381';

const files = [
  { in: 'media__1785844911286.jpg', out: 'leader-1-transparent.png' },
  { in: 'media__1785844911584.jpg', out: 'leader-2-transparent.png' },
  { in: 'media__1785844911619.jpg', out: 'leader-3-transparent.png' }
];

async function testThreshold() {
  for (const item of files) {
    const fullPath = path.join(brainDir, item.in);
    const { data, info } = await sharp(fullPath)
      .raw()
      .toBuffer({ resolveWithObject: true });

    // Check corner pixel values
    console.log(`=== ${item.in} ===`);
    console.log('Top-left pixel RGB:', data[0], data[1], data[2]);
    console.log('Top-right pixel RGB:', data[(info.width - 1) * 3], data[(info.width - 1) * 3 + 1], data[(info.width - 1) * 3 + 2]);
  }
}

testThreshold().catch(console.error);

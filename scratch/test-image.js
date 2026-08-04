const sharp = require('sharp');
const path = require('path');

const brainDir = 'C:\\Users\\HP\\.gemini\\antigravity-ide\\brain\\9399bece-fefc-409e-bfdf-9095e530f381';

const files = [
  'media__1785844911286.jpg',
  'media__1785844911584.jpg',
  'media__1785844911619.jpg'
];

async function inspect() {
  for (const f of files) {
    const fullPath = path.join(brainDir, f);
    const meta = await sharp(fullPath).metadata();
    console.log(f, meta.width, meta.height, meta.channels, meta.format);
  }
}

inspect().catch(console.error);

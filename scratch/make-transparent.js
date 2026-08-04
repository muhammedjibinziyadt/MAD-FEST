const sharp = require('sharp');
const path = require('path');

const brainDir = 'C:\\Users\\HP\\.gemini\\antigravity-ide\\brain\\9399bece-fefc-409e-bfdf-9095e530f381';
const outputDir = 'd:\\editing\\coding\\madrssa fest\\Funoon-Fiesta2.0\\public\\img\\leaders';

const files = [
  { in: 'media__1785844911286.jpg', outTransparent: 'leader-1-transparent.png', outJpg: 'leader-1.png' },
  { in: 'media__1785844911584.jpg', outTransparent: 'leader-2-transparent.png', outJpg: 'leader-2.png' },
  { in: 'media__1785844911619.jpg', outTransparent: 'leader-3-transparent.png', outJpg: 'leader-3.jpg' }
];

async function removeBlackBackgroundBFS(inputPath, outputPath) {
  const image = sharp(inputPath);
  const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;

  const totalPixels = width * height;
  const alpha = new Uint8Array(totalPixels).fill(255);
  const visited = new Uint8Array(totalPixels).fill(0);

  const queue = [];

  const getIdx = (x, y) => y * width + x;

  const isDark = (x, y, threshold = 22) => {
    const idx = (y * width + x) * channels;
    const r = data[idx];
    const g = data[idx + 1];
    const b = data[idx + 2];
    // Return true if all RGB components are below dark threshold
    return r <= threshold && g <= threshold && b <= threshold;
  };

  // Add border pixels to BFS queue if dark
  for (let x = 0; x < width; x++) {
    if (isDark(x, 0)) {
      const idx = getIdx(x, 0);
      visited[idx] = 1;
      alpha[idx] = 0;
      queue.push(x, 0);
    }
    if (isDark(x, height - 1)) {
      const idx = getIdx(x, height - 1);
      visited[idx] = 1;
      alpha[idx] = 0;
      queue.push(x, height - 1);
    }
  }

  for (let y = 0; y < height; y++) {
    if (isDark(0, y)) {
      const idx = getIdx(0, y);
      if (!visited[idx]) {
        visited[idx] = 1;
        alpha[idx] = 0;
        queue.push(0, y);
      }
    }
    if (isDark(width - 1, y)) {
      const idx = getIdx(width - 1, y);
      if (!visited[idx]) {
        visited[idx] = 1;
        alpha[idx] = 0;
        queue.push(width - 1, y);
      }
    }
  }

  // BFS
  let head = 0;
  const dx = [-1, 1, 0, 0, -1, -1, 1, 1];
  const dy = [0, 0, -1, 1, -1, 1, -1, 1];

  while (head < queue.length) {
    const cx = queue[head++];
    const cy = queue[head++];

    for (let i = 0; i < 8; i++) {
      const nx = cx + dx[i];
      const ny = cy + dy[i];

      if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
        const nIdx = getIdx(nx, ny);
        if (!visited[nIdx]) {
          if (isDark(nx, ny)) {
            visited[nIdx] = 1;
            alpha[nIdx] = 0;
            queue.push(nx, ny);
          }
        }
      }
    }
  }

  // Soft edge feathering for transition pixels near boundary
  const softThresholdLow = 22;
  const softThresholdHigh = 45;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = getIdx(x, y);
      if (alpha[idx] === 255) {
        // Check if any 8-neighbor is transparent
        let hasTransparentNeighbor = false;
        for (let i = 0; i < 8; i++) {
          const nx = x + dx[i];
          const ny = y + dy[i];
          if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
            if (alpha[getIdx(nx, ny)] === 0) {
              hasTransparentNeighbor = true;
              break;
            }
          }
        }

        if (hasTransparentNeighbor) {
          const pixelIdx = (y * width + x) * channels;
          const r = data[pixelIdx];
          const g = data[pixelIdx + 1];
          const b = data[pixelIdx + 2];
          const maxVal = Math.max(r, g, b);
          if (maxVal <= softThresholdHigh) {
            const factor = Math.max(0, (maxVal - softThresholdLow) / (softThresholdHigh - softThresholdLow));
            alpha[idx] = Math.round(factor * 255);
          }
        }
      }
    }
  }

  // Construct RGBA buffer
  const rgbaBuffer = Buffer.alloc(width * height * 4);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = getIdx(x, y);
      const srcIdx = idx * channels;
      const destIdx = idx * 4;

      rgbaBuffer[destIdx] = data[srcIdx];
      rgbaBuffer[destIdx + 1] = data[srcIdx + 1];
      rgbaBuffer[destIdx + 2] = data[srcIdx + 2];
      rgbaBuffer[destIdx + 3] = alpha[idx];
    }
  }

  await sharp(rgbaBuffer, {
    raw: { width, height, channels: 4 }
  })
    .png()
    .toFile(outputPath);

  console.log(`Saved transparent image to: ${outputPath}`);
}

async function processAll() {
  for (const item of files) {
    const inputPath = path.join(brainDir, item.in);
    const transparentPath = path.join(outputDir, item.outTransparent);
    const origPath = path.join(outputDir, item.outJpg);

    // Save transparent PNG
    await removeBlackBackgroundBFS(inputPath, transparentPath);

    // Also copy original JPG to public/img/leaders/
    await sharp(inputPath).toFile(origPath);
    console.log(`Saved original image to: ${origPath}`);
  }
}

processAll().catch(console.error);

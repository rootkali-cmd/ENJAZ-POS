const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const pngPath = path.join(__dirname, '../public/favicon-512x512.png');
const publicDir = path.join(__dirname, '../public');

const sizes = [16, 32, 48, 64, 128, 192, 256, 512];

async function generateFavicons() {
  try {
    // Check if PNG exists
    if (!fs.existsSync(pngPath)) {
      console.error('PNG file not found:', pngPath);
      process.exit(1);
    }

    console.log('Generating favicons from PNG...');
    
    for (const size of sizes) {
      if (size === 512) continue; // Skip 512 as it's the source
      const outputPath = path.join(publicDir, `favicon-${size}x${size}.png`);
      
      await sharp(pngPath)
        .resize(size, size)
        .png()
        .toFile(outputPath);
        
      console.log(`Generated: favicon-${size}x${size}.png`);
    }
    
    console.log('All favicons generated successfully!');
  } catch (error) {
    console.error('Error generating favicons:', error);
    process.exit(1);
  }
}

generateFavicons();
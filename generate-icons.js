const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

const sizes = [72, 96, 128, 144, 152, 167, 180, 192, 512];
const splashSizes = [
    { width: 1125, height: 2436 },
    { width: 1536, height: 2048 },
    { width: 1668, height: 2224 },
    { width: 2048, height: 2732 },
    { width: 828, height: 1792 }
];

async function generateIcons() {
    const svgBuffer = await fs.readFile('assets/logo.svg');
    
    // Generate app icons
    for (const size of sizes) {
        await sharp(svgBuffer)
            .resize(size, size)
            .png()
            .toFile(`assets/icons/icon-${size}.png`);
        console.log(`Generated ${size}x${size} icon`);
    }

    // Generate splash screens
    for (const { width, height } of splashSizes) {
        // Create a white background
        await sharp({
            create: {
                width,
                height,
                channels: 4,
                background: { r: 255, g: 255, b: 255, alpha: 1 }
            }
        })
        .composite([{
            input: svgBuffer,
            gravity: 'center',
            width: Math.min(width, height) * 0.4, // Icon takes 40% of the smaller dimension
            height: Math.min(width, height) * 0.4
        }])
        .png()
        .toFile(`assets/icons/splash-${width}x${height}.png`);
        console.log(`Generated ${width}x${height} splash screen`);
    }
}

generateIcons().catch(console.error);
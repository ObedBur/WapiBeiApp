const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

async function generate() {
  const input = path.resolve(__dirname, '../src/assets/wapibei.png');
  if (!fs.existsSync(input)) {
    console.error('Source image not found:', input);
    process.exit(1);
  }

  const iconsOut = path.resolve(__dirname, '../public/icons');
  const splashOut = path.resolve(__dirname, '../public/splash');
  fs.mkdirSync(iconsOut, { recursive: true });
  fs.mkdirSync(splashOut, { recursive: true });

  const iconSizes = [72, 96, 128, 144, 152, 192, 384, 512];
  const splashSizes = [
    { w: 640, h: 1136 },
    { w: 750, h: 1334 },
    { w: 828, h: 1792 },
    { w: 1125, h: 2436 },
    { w: 1242, h: 2688 },
    { w: 1536, h: 2048 },
    { w: 1668, h: 2224 },
    { w: 2048, h: 2732 }
  ];

  console.log('Generating icons...');
  await Promise.all(
    iconSizes.map((size) => {
      const out = path.join(iconsOut, `icon-${size}.png`);
      return sharp(input).resize(size, size, { fit: 'cover' }).png().toFile(out);
    })
  );

  console.log('Generating splash images...');
  await Promise.all(
    splashSizes.map((s) => {
      const out = path.join(splashOut, `splash-${s.w}x${s.h}.png`);
      return sharp(input).resize(s.w, s.h, { fit: 'cover' }).png().toFile(out);
    })
  );

  console.log('Icons and splash images generated in public/icons and public/splash');
}

generate().catch((err) => {
  console.error('Failed to generate images:', err);
  process.exit(1);
});



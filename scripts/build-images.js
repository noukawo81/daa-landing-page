const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const projectRoot = path.resolve(__dirname, '..');
const sourceDir = path.join(projectRoot, 'images');
const outputDir = path.join(projectRoot, 'assets', 'img');

async function build() {
  fs.mkdirSync(outputDir, { recursive: true });

  const files = fs.readdirSync(sourceDir).filter((name) => /\.(png|jpe?g)$/i.test(name));
  for (const name of files) {
    const source = path.join(sourceDir, name);
    const baseName = name.replace(/\.[^.]+$/, '');
    await sharp(source)
      .webp({ quality: 82 })
      .toFile(path.join(outputDir, `${baseName}.webp`));
  }

  const logo = path.join(sourceDir, 'logo.png');
  await sharp(logo).resize(512, 512).webp({ quality: 88 }).toFile(path.join(outputDir, 'logo-512.webp'));
  await sharp(logo).resize(192, 192).png({ compressionLevel: 9 }).toFile(path.join(outputDir, 'logo-192.png'));
}

build().catch((error) => {
  console.error(error);
  process.exit(1);
});

import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const ROOT = process.cwd();
const ASSETS_DIR = path.join(ROOT, 'Assets');
const MANIFEST_PATH = path.join(ROOT, 'docs', 'audit', 'asset-manifest-35.json');
const OUTPUT_DIR = path.join(ROOT, 'public', 'images', 'products');
const REPORT_PATH = path.join(ROOT, 'src', 'data', 'generated-media-map.json');

async function main() {
  const raw = await fs.readFile(MANIFEST_PATH, 'utf-8');
  const manifest = JSON.parse(raw);

  await fs.mkdir(OUTPUT_DIR, { recursive: true });
  await fs.mkdir(path.dirname(REPORT_PATH), { recursive: true });

  const mediaMap = {};
  let totalSourceBytes = 0;
  let totalWebp480Bytes = 0;
  let totalWebp960Bytes = 0;
  let totalAvif960Bytes = 0;

  for (const item of manifest.assets) {
    const srcPath = path.join(ASSETS_DIR, item.file);
    const stat = await fs.stat(srcPath);
    totalSourceBytes += stat.size;

    const num = item.file.replace('.jpg', '');
    const baseName = `${item.productSlug}-${num}`;

    const out480Webp = path.join(OUTPUT_DIR, `${baseName}-480.webp`);
    const out960Webp = path.join(OUTPUT_DIR, `${baseName}-960.webp`);
    const out960Avif = path.join(OUTPUT_DIR, `${baseName}-960.avif`);

    // Subtle warm-studio crop keeping full pouch & label 100% intact (3:4 portrait)
    // Source is 1170x1560 (exact 3:4). We keep full label legibility and gently normalize brightness/sharpness.
    const pipelineBase = sharp(srcPath).rotate();

    const [info480, info960Webp, info960Avif] = await Promise.all([
      pipelineBase
        .clone()
        .resize({ width: 480, height: 640, fit: 'cover', position: 'centre' })
        .sharpen({ sigma: 0.6 })
        .webp({ quality: 82, effort: 5 })
        .toFile(out480Webp),
      pipelineBase
        .clone()
        .resize({ width: 960, height: 1280, fit: 'cover', position: 'centre' })
        .sharpen({ sigma: 0.5 })
        .webp({ quality: 86, effort: 5 })
        .toFile(out960Webp),
      pipelineBase
        .clone()
        .resize({ width: 960, height: 1280, fit: 'cover', position: 'centre' })
        .sharpen({ sigma: 0.5 })
        .avif({ quality: 62, effort: 4 })
        .toFile(out960Avif),
    ]);

    totalWebp480Bytes += info480.size;
    totalWebp960Bytes += info960Webp.size;
    totalAvif960Bytes += info960Avif.size;

    mediaMap[item.file] = {
      sourceFile: item.file,
      productSlug: item.productSlug,
      thumbWebp: `/images/products/${baseName}-480.webp`,
      largeWebp: `/images/products/${baseName}-960.webp`,
      largeAvif: `/images/products/${baseName}-960.avif`,
      width: 960,
      height: 1280,
      thumbBytes: info480.size,
      largeWebpBytes: info960Webp.size,
      largeAvifBytes: info960Avif.size,
    };
  }

  await fs.writeFile(REPORT_PATH, JSON.stringify(mediaMap, null, 2), 'utf-8');

  console.log(`Processed ${manifest.assets.length}/35 assets cleanly without modifying Assets/.`);
  console.log(`Total source JPEGs: ${(totalSourceBytes / 1024 / 1024).toFixed(2)} MB`);
  console.log(`Total 480w WebP cards: ${(totalWebp480Bytes / 1024 / 1024).toFixed(2)} MB (avg ${(totalWebp480Bytes / 35 / 1024).toFixed(1)} KB/card)`);
  console.log(`Total 960w WebP detail: ${(totalWebp960Bytes / 1024 / 1024).toFixed(2)} MB (avg ${(totalWebp960Bytes / 35 / 1024).toFixed(1)} KB/detail)`);
  console.log(`Total 960w AVIF detail: ${(totalAvif960Bytes / 1024 / 1024).toFixed(2)} MB (avg ${(totalAvif960Bytes / 35 / 1024).toFixed(1)} KB/detail)`);
}

main().catch((err) => {
  console.error('Asset processing failed:', err);
  process.exit(1);
});

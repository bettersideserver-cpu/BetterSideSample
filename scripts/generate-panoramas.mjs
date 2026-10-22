import { readdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const files = (await readdir(path.join(root, 'images'), { withFileTypes: true }))
  .filter(file => file.isFile() && /\.(jpe?g|png|webp)$/i.test(file.name))
  .map(file => file.name)
  .sort((a, b) => a.localeCompare(b, 'en', { numeric: true }));
const panoramas = files.map(name => ({
  src: `images/${name}`,
  title: name.replace(/\.[^.]+$/, '').replace(/^\d+[\s_-]*/, '').replace(/[_-]+/g, ' ').replace(/([a-z])([A-Z])/g, '$1 $2') || name
}));
await writeFile(path.join(root, 'panoramas.js'),
  '// Generated from images/. Run node scripts/generate-panoramas.mjs after adding images.\nwindow.PANORAMAS = ' + JSON.stringify(panoramas, null, 2) + ';\n');
console.log(`Found ${panoramas.length} panorama(s).`);

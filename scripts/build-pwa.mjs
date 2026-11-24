import { readFileSync, readdirSync, writeFileSync, statSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { deflateSync } from 'node:zlib';
import { join, relative } from 'node:path';

const root = 'dist/angular-ahorcado/browser';
if (!statSync(join(root, 'index.html')).isFile()) throw new Error('Missing production build');

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc ^= byte;
    for (let i = 0; i < 8; i++) crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
  }
  return (crc ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const name = Buffer.from(type);
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([name, data])));
  return Buffer.concat([length, name, data, crc]);
}
function icon(size) {
  const header = Buffer.alloc(13);
  header.writeUInt32BE(size, 0);
  header.writeUInt32BE(size, 4);
  header[8] = 8;
  header[9] = 2;
  const pixels = Buffer.alloc(size * (size * 3 + 1));
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const u = x / size, v = y / size;
      const left = Math.abs(u - (0.5 - (v - .25) * .47)) < .045;
      const right = Math.abs(u - (0.5 + (v - .25) * .47)) < .045;
      const cross = v > .52 && v < .59 && u > .36 && u < .64;
      const color = ((v > .25 && v < .75 && (left || right)) || cross)
        ? [255, 255, 255] : [14, 110, 124];
      const at = y * (size * 3 + 1) + 1 + x * 3;
      pixels.set(color, at);
    }
  }
  return Buffer.concat([
    Buffer.from([137,80,78,71,13,10,26,10]),
    chunk('IHDR', header), chunk('IDAT', deflateSync(pixels)), chunk('IEND', Buffer.alloc(0))
  ]);
}

for (const size of [192, 512]) writeFileSync(join(root, 'icon-' + size + '.png'), icon(size));
writeFileSync(join(root, 'manifest.webmanifest'), JSON.stringify({
  id: './', name: 'Ahorcado en español', short_name: 'Ahorcado', lang: 'es',
  start_url: './', scope: './', display: 'standalone',
  background_color: '#f4f1e8', theme_color: '#0e6e7c',
  icons: [192, 512].map(size => ({
    src: 'icon-' + size + '.png', sizes: size + 'x' + size, type: 'image/png', purpose: 'any maskable'
  }))
}, null, 2));

function list(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const file = join(dir, entry.name);
    return entry.isDirectory() ? list(file) : [relative(root, file).replaceAll('\\', '/')];
  });
}
const assets = list(root).filter(path => !path.endsWith('.map') && path !== 'sw.js' && !path.startsWith('.')).sort();
const template = readFileSync('scripts/service-worker.js', 'utf8');
const hash = createHash('sha256').update(template);
for (const path of assets) hash.update(path).update(readFileSync(join(root, path)));
const version = hash.digest('hex').slice(0, 20);
writeFileSync(join(root, 'sw.js'), template.replace('__VERSION__', JSON.stringify(version)).replace('__ASSETS__', JSON.stringify(assets)));
console.log('Offline cache: ' + assets.length + ' files; version ' + version);

import { readFileSync } from 'node:fs';
import path from 'node:path';

export interface ImageSize {
  width: number;
  height: number;
}

function pngSize(buf: Buffer): ImageSize | null {
  if (buf.length < 24 || buf[0] !== 0x89 || buf.toString('ascii', 1, 4) !== 'PNG') return null;
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
}

function jpegSize(buf: Buffer): ImageSize | null {
  if (buf.length < 4 || buf[0] !== 0xff || buf[1] !== 0xd8) return null;
  let offset = 2;
  while (offset + 9 < buf.length) {
    if (buf[offset] !== 0xff) return null;
    const marker = buf[offset + 1];
    if (marker === 0xd8) {
      offset += 2;
      continue;
    }
    if (marker === 0xd9 || marker === 0xda) return null;
    const size = buf.readUInt16BE(offset + 2);
    if (size < 2) return null;
    if (marker >= 0xc0 && marker <= 0xc2) {
      return {
        height: buf.readUInt16BE(offset + 5),
        width: buf.readUInt16BE(offset + 7),
      };
    }
    offset += 2 + size;
  }
  return null;
}

function svgSize(buf: Buffer): ImageSize | null {
  const head = buf.subarray(0, Math.min(buf.length, 800)).toString('utf8');
  if (!head.includes('<svg')) return null;
  const text = buf.toString('utf8');
  const viewBox = text.match(/viewBox="\s*[\d.]+\s+[\d.]+\s+([\d.]+)\s+([\d.]+)\s*"/);
  if (!viewBox) return null;
  return { width: Math.round(Number(viewBox[1])), height: Math.round(Number(viewBox[2])) };
}

export function readImageSize(buf: Buffer): ImageSize | null {
  return pngSize(buf) ?? jpegSize(buf) ?? svgSize(buf);
}

/** Dimensions d’un fichier servi depuis `public/` (chemin site, ex. `/brand/og-default.png`). */
export function publicImageSize(src: string): ImageSize | null {
  const rel = src.replace(/^\//, '').split('?')[0] ?? '';
  if (!rel || rel.includes('..')) return null;
  try {
    return readImageSize(readFileSync(path.join(process.cwd(), 'public', rel)));
  } catch {
    return null;
  }
}

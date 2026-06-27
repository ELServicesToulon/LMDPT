/**
 * Convertit le GeoJSON départements (gregoiredavid/france-geojson) en chemins SVG.
 * Source cartographique : IGN/INSEE via france-geojson (Licence Ouverte).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { normalizeDeptCode } from '../src/lib/department-build.ts';

const GEOJSON_URL =
  'https://raw.githubusercontent.com/gregoiredavid/france-geojson/master/departements-version-simplifiee.geojson';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outPath = path.join(__dirname, '../src/data/geo/departments-paths.json');

const WIDTH = 520;
const HEIGHT = 580;
const PAD = 8;

interface GeoFeature {
  type: 'Feature';
  geometry: { type: 'Polygon' | 'MultiPolygon'; coordinates: number[][][] | number[][][][] };
  properties: { code: string; nom: string };
}

function flattenCoords(geometry: GeoFeature['geometry']): number[][] {
  if (geometry.type === 'Polygon') {
    return geometry.coordinates as number[][][];
  }
  return (geometry.coordinates as number[][][][]).flat();
}

function ringToPath(ring: number[][], project: (lon: number, lat: number) => [number, number]): string {
  return (
    ring
      .map((pt, idx) => {
        const [x, y] = project(pt[0]!, pt[1]!);
        return `${idx === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`;
      })
      .join(' ') + ' Z'
  );
}

async function main(): Promise<void> {
  console.log('Téléchargement', GEOJSON_URL);
  const response = await fetch(GEOJSON_URL);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);

  const geo = (await response.json()) as { features: GeoFeature[] };

  let minLon = Infinity;
  let maxLon = -Infinity;
  let minLat = Infinity;
  let maxLat = -Infinity;

  for (const feature of geo.features) {
    for (const ring of flattenCoords(feature.geometry)) {
      for (const pt of ring) {
        minLon = Math.min(minLon, pt[0]!);
        maxLon = Math.max(maxLon, pt[0]!);
        minLat = Math.min(minLat, pt[1]!);
        maxLat = Math.max(maxLat, pt[1]!);
      }
    }
  }

  const project = (lon: number, lat: number): [number, number] => {
    const x = PAD + ((lon - minLon) / (maxLon - minLon)) * (WIDTH - 2 * PAD);
    const y = PAD + ((maxLat - lat) / (maxLat - minLat)) * (HEIGHT - 2 * PAD);
    return [Math.round(x * 100) / 100, Math.round(y * 100) / 100];
  };

  const departements = geo.features.map((feature) => {
    const rings = flattenCoords(feature.geometry);
    const d = rings.map((ring) => ringToPath(ring, project)).join(' ');
    return {
      code: normalizeDeptCode(feature.properties.code),
      nom: feature.properties.nom,
      d,
    };
  });

  const payload = {
    viewBox: `0 0 ${WIDTH} ${HEIGHT}`,
    source: GEOJSON_URL,
    source_label: 'france-geojson (IGN/INSEE) — departements-version-simplifiee.geojson',
    departements,
  };

  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, `${JSON.stringify(payload)}\n`, 'utf8');
  console.log(`OK — ${departements.length} paths → ${outPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

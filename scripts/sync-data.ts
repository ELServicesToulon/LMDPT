import { writeManifest } from '../src/lib/cache';
import { buildManifestLive } from '../src/lib/sources';

async function main(): Promise<void> {
  console.log('Sync data.gouv.fr → data/cache/sources-manifest.json');
  const manifest = await buildManifestLive();
  await writeManifest(manifest);

  const hits = manifest.catalogSearches.reduce((sum, s) => sum + s.hits.length, 0);
  console.log(
    `OK — ${manifest.catalogSearches.length} recherches, ${hits} hits catalogue, ${manifest.datasets.length} jeux détaillés`,
  );
  console.log(`Horodatage : ${manifest.fetchedAt}`);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});

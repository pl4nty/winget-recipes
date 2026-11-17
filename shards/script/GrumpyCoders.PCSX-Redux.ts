import { defineShard } from 'anthelion';

// PCSX-Redux's own updater feed (AppDistrib): the catalog lists build ids, and each build manifest
// points at the zip, whose name carries the version (pcsx-redux-nightly-<version>-x64.zip).
export default defineShard(async () => {
	const base = 'https://distrib.app/storage/manifests/pcsx-redux/dev-win-x64';
	const catalogResponse = await fetch(`${base}/manifest.json`);
	if (!catalogResponse.ok) throw new Error(`PCSX-Redux catalog returned HTTP ${catalogResponse.status}`);
	const catalog = (await catalogResponse.json()) as { builds: { id: number }[] };
	if (catalog.builds.length === 0) throw new Error('PCSX-Redux catalog lists no builds');
	const id = Math.max(...catalog.builds.map((b) => b.id));

	const buildResponse = await fetch(`${base}/manifest-${id}.json`);
	if (!buildResponse.ok) throw new Error(`PCSX-Redux build ${id} manifest returned HTTP ${buildResponse.status}`);
	const build = (await buildResponse.json()) as { path: string };
	const version = /\/pcsx-redux-nightly-(\d+\.\d+\.\d+)-x64\.zip$/.exec(build.path)?.[1];
	if (!version) throw new Error(`Unexpected PCSX-Redux build path ${build.path}`);

	return {
		version,
		urls: () => [`https://distrib.app${build.path}`],
	};
});

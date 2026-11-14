import { inflateRawSync } from 'node:zlib';

import { defineShard } from 'anthelion';

function compareVersions(a: string, b: string) {
	const [left, right] = [a, b].map((version) => version.split('.').map(Number));
	for (let i = 0; i < Math.max(left!.length, right!.length); i++) {
		const difference = (left![i] ?? 0) - (right![i] ?? 0);
		if (difference) return difference;
	}
	return 0;
}

/** Contents of a single-folder MSZIP cabinet, which is what Dell publishes its catalogs as. */
function readCab(cab: Uint8Array): Uint8Array {
	const view = new DataView(cab.buffer, cab.byteOffset, cab.byteLength);
	if (new TextDecoder().decode(cab.subarray(0, 4)) !== 'MSCF') throw new Error('Not a cabinet file');

	let offset = 36;
	let dataReserve = 0;
	if (view.getUint16(30, true) & 4) {
		dataReserve = view.getUint8(39);
		offset += 4 + view.getUint16(36, true);
	}
	if (view.getUint16(26, true) !== 1) throw new Error('Expected a single MSZIP folder');

	const blockCount = view.getUint16(offset + 4, true);
	const chunks: Uint8Array[] = [];
	let position = view.getUint32(offset, true);
	for (let i = 0; i < blockCount; i++) {
		const size = view.getUint16(position + 4, true);
		const start = position + 8 + dataReserve;
		// Each block's deflate stream may reference the previous block's output
		const dictionary = chunks.at(-1);
		chunks.push(inflateRawSync(cab.subarray(start + 2, start + size), dictionary ? { dictionary } : {}));
		position = start + size;
	}
	return Buffer.concat(chunks);
}

async function fetchCatalog(path: string) {
	const response = await fetch(`https://downloads.dell.com/${path}`);
	if (!response.ok) throw new Error(`${path} returned ${response.status}`);
	return new TextDecoder('utf-16le').decode(readCab(new Uint8Array(await response.arrayBuffer())));
}

/**
 * The newest package Dell's per-model catalogs list for a Dell Update Package component. The public
 * CatalogPC.cab lags releases, so read the most recently regenerated model catalogs instead.
 */
async function getLatestComponent(index: string, componentId: string, nameFilter: RegExp, collectorType: string) {
	const paths = [
		...index.matchAll(
			/<ManifestInformation[^>]*creationDateTime="([^"]+)"[^>]*path="([^"]+)"[^>]*inventoryCollectorType="([^"]+)"/g,
		),
	]
		.filter(([, , , type]) => type === collectorType)
		.sort(([, a], [, b]) => b!.localeCompare(a!))
		.slice(0, 10);

	const components = (await Promise.all(paths.map(([, , path]) => fetchCatalog(path!)))).flatMap((catalog) =>
		catalog
			.split('<SoftwareComponent ')
			.slice(1)
			.filter((component) => component.includes(`componentID="${componentId}"`))
			.map((component) => ({
				path: component.match(/path="([^"]+)"/)?.[1] ?? '',
				version: component.match(/vendorVersion="([^"]+)"/)?.[1] ?? '',
			}))
			.filter(({ path, version }) => version && nameFilter.test(path)),
	);
	const latest = components.sort((a, b) => compareVersions(b.version, a.version))[0];
	if (!latest) throw new Error(`No package for component ${componentId}`);
	return latest;
}

export default defineShard(async () => {
	const index = await fetchCatalog('catalog/CatalogIndexPC.cab');
	// 114796 is Dell Command | Configure's x64 component ID. Dell also ships an ARM64 build
	// (component 113783, WINARM64), but komac classifies that exe as portable, so it is left out.
	const x64 = await getLatestComponent(index, '114796', /Dell-Command-Configure-Application_[^_]+_WIN64_/, 'COMPACT');

	return {
		version: x64.version,
		urls: () => [`https://dl.dell.com/${x64.path}`],
	};
});

import { strFromU8, unzipSync } from 'fflate';

// komac has no version source for MSIX or APPX installers, so shards read the package Identity version.
export async function download(url: string) {
	const response = await fetch(url);
	if (!response.ok) throw new Error(`${url} returned ${response.status}`);
	return new Uint8Array(await response.arrayBuffer());
}

/** Identity version of an MSIX, APPX or bundle, or of the first package in an archive whose path matches `nested`. */
export function appxVersion(bytes: Uint8Array, nested?: RegExp): string {
	if (nested) {
		const files = unzipSync(bytes, { filter: ({ name }) => nested.test(name) });
		const name = Object.keys(files).sort()[0];
		if (!name) throw new Error(`No package matches ${nested}`);
		return appxVersion(files[name]!);
	}
	const files = unzipSync(bytes, {
		filter: ({ name }) => name === 'AppxManifest.xml' || name === 'AppxMetadata/AppxBundleManifest.xml',
	});
	const manifest = Object.values(files)[0];
	const version = manifest && /<Identity\b[^>]*\sVersion="([^"]+)"/i.exec(strFromU8(manifest))?.[1];
	if (!version) throw new Error('No Identity Version in the package manifest');
	return version;
}

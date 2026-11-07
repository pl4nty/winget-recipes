import { defineShard } from 'anthelion';
import { komac, match } from 'anthelion/helpers';
import ky from 'ky';

const url = 'https://www.vzvz.nl/media/downloads/zorg-id-desktop-app-windows/download';

export default defineShard(async () => {
	const { headers } = await ky.head(url);
	const state = headers.get('last-modified');
	if (!state) {
		throw new Error('No Last-Modified header found');
	}

	// The unversioned download serves "ZORG-ID Desktop App for Windows-<version>.zip", which wraps
	// an msi with the same base name
	const {
		captures: { name, short },
	} = match(
		headers.get('content-disposition'),
		/filename="?(?<name>ZORG-ID Desktop App for Windows-(?<short>\d+(?:\.\d+)+))\.zip"?/,
		'No versioned zip filename in Content-Disposition',
	);
	const installer = { url, architecture: 'x86' as const, nestedInstallerMatches: [`${name}.msi`] };

	// Upstream versions use the msi's four-part ProductVersion (shown as the ARP DisplayVersion),
	// while the filename only has three parts
	const analysis = await komac.analyzeInstaller(installer);
	const nested = analysis.installers.find((i) => i.appsAndFeaturesEntries.length > 0);
	const version =
		analysis.versions.product ??
		nested?.versions.product ??
		nested?.appsAndFeaturesEntries.find((e) => e.displayVersion)?.displayVersion ??
		short;

	return { version, urls: () => [installer], state, replace: true };
});

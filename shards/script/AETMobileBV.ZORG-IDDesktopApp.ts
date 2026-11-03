import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';
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
		captures: { name },
	} = match(
		headers.get('content-disposition'),
		/filename="?(?<name>ZORG-ID Desktop App for Windows-\d+(?:\.\d+)+)\.zip"?/,
		'No versioned zip filename in Content-Disposition',
	);

	return {
		version: { source: 'product' },
		urls: () => [{ url, architecture: 'x86', nestedInstallerMatches: [`${name}.msi`] }],
		state,
		replace: true,
	};
});

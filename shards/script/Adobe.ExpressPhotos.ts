import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';

const url = 'https://harmonydl.adobe.com/pub/adobe/harmony/release/windows/x64/PSExpress_Package.msixbundle';

// Adobe only publishes an unversioned bundle. Its first zip entry is the inner package,
// named PSExpress_<version>.0.msix, so the local file header at the start of the bundle
// gives the version without downloading all of it.
export default defineShard(async () => {
	const response = await fetch(url, { headers: { Range: 'bytes=0-1023' } });
	if (!response.ok) throw new Error(`${url} returned ${response.status}`);
	const header = new TextDecoder('latin1').decode(await response.arrayBuffer());
	const {
		captures: { version },
	} = match(header, /PSExpress_(?<version>\d+\.\d+\.\d+)\.0\.msix/, 'No package name found in the bundle');

	return {
		version,
		urls: () => [url],
	};
});

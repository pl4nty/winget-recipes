import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';

// The download URL is unversioned and the product page lags behind, so read the setup's FileVersion
// (e.g. 26.0.1.0) from the first MiB of the installer and keep its first three parts, as upstream does.
export default defineShard(async () => {
	const url = 'https://download.lsoft.net/DiskImageTrialSetup.exe';
	const bytes = await fetch(url, { headers: { Range: 'bytes=0-1048575' } }).then((response) => response.arrayBuffer());
	// VERSIONINFO strings are UTF-16LE and may start at an odd offset, so decode both alignments.
	const decoder = new TextDecoder('utf-16le');
	const resources = decoder.decode(bytes) + decoder.decode(bytes.slice(1));
	const {
		groups: [version],
	} = match(resources, /FileVersion\0+(\d+\.\d+\.\d+)(?:\.\d+)?[\s\0]/i, 'No FileVersion found in DiskImageTrialSetup.exe');

	return {
		version,
		urls: () => [url],
	};
});

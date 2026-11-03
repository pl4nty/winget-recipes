import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';

// wubi.sogou.com links a time-signed CDN URL whose file name carries only the
// marketing version (e.g. 5.5f). PackageVersion is the installer's own version,
// so it comes from the file, and the file name's version is the state token.
// Upstream lists the same installer for x86, x64, arm and arm64.
export default defineShard(async () => {
	const html = await fetch('https://wubi.sogou.com/').then((response) => response.text());
	const {
		groups: [url],
		captures: { name },
	} = match(html, /(https:\/\/ime-sec\.gtimg\.com\/[^"'\s]+\/sogou_wubi_(?<name>[\w.]+)\.exe)/);

	return {
		version: { source: 'file' },
		urls: () => [
			{ url, architecture: 'x86' },
			{ url, architecture: 'x64' },
			{ url, architecture: 'arm' },
			{ url, architecture: 'arm64' },
		],
		releaseNotes: { releaseNotesUrl: 'https://wubi.sogou.com/log.php' },
		replace: true,
		state: name,
	};
});

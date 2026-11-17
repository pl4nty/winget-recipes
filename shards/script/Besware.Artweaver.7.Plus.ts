import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';

// The 7.x download link is unversioned and sends no ETag or Last-Modified header, so the newest
// 7.0.x entry on the changelog is the update state and komac reads the version from the installer.
export default defineShard(async () => {
	const changelog = await fetch('https://www.artweaver.de/en/changelog').then((response) => response.text());
	const {
		captures: { release },
	} = match(changelog, /Artweaver (?<release>7\.\d+\.\d+)/i, 'No Artweaver 7 release on the changelog');

	return {
		version: { source: 'product' },
		urls: () => [{ url: 'https://www.artweaver.de/direct/ArtweaverPlus7x.exe', architecture: 'x64' }],
		state: release,
		replace: true,
		releaseNotes: { releaseNotesUrl: 'https://www.artweaver.de/en/changelog' },
	};
});

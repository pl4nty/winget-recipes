import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';

// The product page names the release as major.minor (5.3); winget-pkgs files it as major.minor.patch (5.0.0).
export default defineShard(async () => {
	const page = await fetch('https://www.lazesoft.com/lazesoft-recovery-suite.html').then((response) => response.text());
	const {
		groups: [release],
	} = match(page, /Lazesoft Recovery Suite (\d+(?:\.\d+)+) delivers/i);
	const parts = release.split('.');
	const version = [...parts, ...Array(Math.max(0, 3 - parts.length)).fill('0')].join('.');

	return {
		version,
		urls: () => ['https://www.lazesoft.com/downloads/lsrshsetup.exe'],
		releaseNotes: {
			releaseNotesUrl: 'https://www.lazesoft.com/lazesoft-recovery-suite.html',
		},
	};
});

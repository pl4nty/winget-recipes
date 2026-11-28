import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';

// The download page lists the latest release first in its update history, and the
// Dropbox links for every release live in one of the page's Next.js chunks.
export default defineShard(async () => {
	const page = await (await fetch('https://coeiroink.com/download')).text();
	const {
		captures: { version },
	} = match(page, /"updateInfos":\[\{"version":"v\.(?<version>\d+(?:\.\d+)+)"/, 'No COEIROINK version found');
	const name = `COEIROINK_WIN_CPU_v.${version}`;
	const link = new RegExp(`https://www\\.dropbox\\.com/[^"]+/${name.replaceAll('.', '\\.')}\\.zip\\?[^"]+`);
	const chunks = [...new Set(page.match(/\/_next\/static\/chunks\/[^"]+\.js/g) ?? [])];
	let url: string | undefined;
	for (const chunk of chunks) {
		url = (await (await fetch(`https://coeiroink.com${chunk}`)).text()).match(link)?.[0];
		if (url) break;
	}
	if (!url) throw new Error(`No Dropbox link found for ${name}`);

	return {
		version,
		urls: () => [{ url, nestedInstallerMatches: [`${name}/${name}.exe`] }],
		releaseNotes: { releaseNotesUrl: 'https://coeiroink.com/download' },
	};
});

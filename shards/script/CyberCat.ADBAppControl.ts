import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';

const base = 'https://adbappcontrol.com';

// The download buttons call /download/sign/?f=<file>, which returns a short-lived signed URL.
async function signedUrl(file: string) {
	const response = await fetch(`${base}/download/sign/?f=${encodeURIComponent(file)}`);
	if (!response.ok) throw new Error(`${file}: ${response.status} ${await response.text()}`);
	const { url } = (await response.json()) as { url: string };
	return new URL(url, base).href;
}

export default defineShard(async () => {
	const page = await fetch(`${base}/en/pc`).then((response) => response.text());
	const {
		groups: [version],
	} = match(page, /Latest Version<\/h3><span[^>]*>(\d+(?:\.\d+)+)</);

	return {
		version,
		urls: async () => [await signedUrl('win_zip'), await signedUrl('win_exe')],
		releaseNotes: {
			source: 'plain-text',
			sourceUrl: `${base}/en/pc/changelog.txt`,
			releaseNotesUrl: `${base}/en/pc/changelog.txt`,
			cleanup: false,
		},
	};
});

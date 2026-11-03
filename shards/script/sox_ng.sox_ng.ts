import { defineShard } from 'anthelion';

// Asset names do not always follow the tag (14.8.1 shipped sox_ng-4.8.1-win32-exe.zip), so pick the
// Windows zips from the release and skip snapshot builds such as sox_ng-14.8.0+git20260829-win32-exe.zip.
export default defineShard(async () => {
	const release = (await fetch('https://codeberg.org/api/v1/repos/sox_ng/sox_ng/releases/latest').then((response) =>
		response.json(),
	)) as { tag_name: string; assets: { name: string; browser_download_url: string }[] };
	const version = release.tag_name.replace(/^sox_ng-/, '');
	const asset = (arch: string) => {
		const match = release.assets.find((asset) => new RegExp(`^sox_ng-[\\d.]+-${arch}-exe\\.zip$`).test(asset.name));
		if (!match) throw new Error(`No ${arch} zip in ${release.tag_name}`);
		return match.browser_download_url;
	};

	return {
		version,
		urls: () => [asset('win32'), asset('win64')],
		releaseNotes: {
			source: 'json',
			sourceUrl: `https://codeberg.org/api/v1/repos/sox_ng/sox_ng/releases/tags/${release.tag_name}`,
			path: 'body',
			nestedSource: 'markdown',
			cleanup: false,
			releaseNotesUrl: `https://codeberg.org/sox_ng/sox_ng/releases/tag/${release.tag_name}`,
		},
	};
});

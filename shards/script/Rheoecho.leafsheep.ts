import { defineShard } from 'anthelion';

const api = 'https://codeberg.org/api/v1/repos/RheoEcho_Studio/LeafSheep/releases';

export default defineShard(async () => {
	const release = await fetch(`${api}/latest`).then((response) => response.json());
	const version: string = release.tag_name;
	const asset = release.assets.find((a: { name: string }) => /_win64_installer\.exe$/.test(a.name));
	if (!asset) throw new Error(`No win64 installer in Codeberg release ${version}`);

	return {
		version,
		urls: () => [asset.browser_download_url],
		releaseNotes: {
			source: 'json',
			sourceUrl: `${api}/tags/${encodeURIComponent(version)}`,
			path: 'body',
			nestedSource: 'markdown',
			cleanup: false,
			releaseNotesUrl: release.html_url,
		},
	};
});

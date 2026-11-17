import { defineShard } from 'anthelion';

// www.gigabyte.com blocks automated clients, but the download CDN serves each release at a versioned
// path (mb_utility_drm-fix-tool_v<major>.<minor>.zip), so probe candidate versions and take the newest.
const url = (version: string) => `https://download.gigabyte.com/FileList/Utility/mb_utility_drm-fix-tool_v${version}.zip`;

export default defineShard(async () => {
	const candidates: string[] = [];
	for (let major = 4; major >= 1; major--) for (let minor = 9; minor >= 0; minor--) candidates.push(`${major}.${minor}`);

	const found = await Promise.all(
		candidates.map(async (version) => ((await fetch(url(version), { method: 'HEAD' })).ok ? version : undefined)),
	);
	const version = found.find(Boolean);
	if (version) {
		return {
			version,
			urls: () => [url(version)],
			releaseNotes: {
				releaseNotesUrl: 'https://www.gigabyte.com/Press/News/1952',
			},
		};
	}
	throw new Error('No DRM Fix Tool download found');
});

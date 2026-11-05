import { defineShard } from 'anthelion';
import { getLatestRelease } from 'anthelion/github';
import { match } from 'anthelion/helpers';

// Release tags are short (v4.3) while the installer carries the full four-part
// version (pstoedit_gui_setup_x64_4.3.0.0.exe), so take the version from the asset.
export default defineShard(async () => {
	const release = await getLatestRelease({
		owner: 'woglu',
		repo: 'pstoedit',
		useLatestEndpoint: true,
	});

	const url = release.urls().find((url) => /\/pstoedit_gui_setup_x64_[\d.]+\.exe$/.test(url));
	const version = match(url, /pstoedit_gui_setup_x64_(\d+(?:\.\d+)+)\.exe$/).groups[0];

	return {
		version,
		urls: () => [url!],
		releaseNotes: {
			source: 'github',
			owner: 'woglu',
			repo: 'pstoedit',
			tag: release.rawTag,
		},
	};
});

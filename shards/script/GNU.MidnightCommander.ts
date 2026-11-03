import { defineShard } from 'anthelion';
import { getLatestReleaseFromRedirect } from 'anthelion/github';

// Release tags are the full version (4.8.33.236); asset names carry only the build number.
export default defineShard(async () => {
	const { version, rawTag } = await getLatestReleaseFromRedirect({ owner: 'adamyg', repo: 'mcwin32' });
	const build = version.split('.').at(-1);
	const base = `https://github.com/adamyg/mcwin32/releases/download/${rawTag}`;

	return {
		version,
		urls: () => [`${base}/mcwin32-build${build}-setup.exe`, `${base}/mcwin32-build${build}-x64-setup.exe`],
		releaseNotes: { source: 'github', owner: 'adamyg', repo: 'mcwin32', tag: rawTag },
	};
});

import { defineShard } from 'anthelion';
import { getLatestReleaseFromRedirect } from 'anthelion/github';

// Release tags look like RELEASE_7_5; the installer uses the dotted version.
export default defineShard(async () => {
	const { rawTag } = await getLatestReleaseFromRedirect({ owner: 'smartmontools', repo: 'smartmontools' });
	const version = rawTag.replace(/^RELEASE_/, '').replaceAll('_', '.');

	return {
		version,
		urls: () => [
			`https://github.com/smartmontools/smartmontools/releases/download/${rawTag}/smartmontools-${version}.win32-setup.exe`,
		],
		releaseNotes: { source: 'github', owner: 'smartmontools', repo: 'smartmontools', tag: rawTag },
	};
});

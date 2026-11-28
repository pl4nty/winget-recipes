import { defineShard } from 'anthelion';
import { getLatestRelease } from 'anthelion/github';
import { match } from 'anthelion/helpers';

// Tags look like RELEASE_22_0, assets use 22.0 and the package uses 22.0.0.
export default defineShard(async () => {
	const release = await getLatestRelease({ owner: 'openMSX', repo: 'openMSX' });
	const parts = match(release.rawTag, /^RELEASE_(\d+(?:_\d+)*)$/).groups[0].split('_');
	const file = parts.join('.');
	const version = [...parts, '0', '0'].slice(0, Math.max(3, parts.length)).join('.');
	const base = `https://github.com/openMSX/openMSX/releases/download/${release.rawTag}/openmsx-${file}-windows-vc`;

	return {
		version,
		urls: () => [`${base}-x64-bin-msi.zip`, `${base}-x64-bin.zip`],
	};
});

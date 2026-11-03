import { defineShard } from 'anthelion';
import { getLatestRelease } from 'anthelion/github';
import { match } from 'anthelion/helpers';

export default defineShard(async () => {
	const release = await getLatestRelease({
		owner: 'microsoft',
		repo: 'osconfig',
		kind: 'prerelease',
		assetRegex: '^(?:Microsoft\\.OSConfig-[\\d.]+(?:-(?:arm64|x64)\\.msix|\\.msixbundle)|oscfg-[\\d.]+-preview\\d+-(?:aarch64|x86_64)_pc_windows_msvc\\.zip)$',
	});
	const { groups } = match(release.urls().join(' '), /Microsoft\.OSConfig-([\d.]+)\.msixbundle/);

	return {
		version: groups[0],
		urls: release.urls,
	};
});

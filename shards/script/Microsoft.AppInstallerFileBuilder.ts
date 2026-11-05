import { defineShard } from 'anthelion';
import { getLatestRelease } from 'anthelion/github';
import { match } from 'anthelion/helpers';

export default defineShard(async () => {
	const release = await getLatestRelease({
		owner: 'microsoft',
		repo: 'MSIX-Toolkit',
		sortByVersion: true,
		assetRegex: '^AppInstallerFileBuilder_[\\d.]+_x86\\.msix$',
	});
	const { groups } = match(release.urls()[0]!, /_([\d.]+)_x86\.msix$/);

	return {
		version: groups[0],
		urls: release.urls,
	};
});

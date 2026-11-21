import { defineShard } from 'anthelion';
import { githubClient } from 'anthelion/github';

// Later packaging releases (0.12.6-2 and up, 0.12.6.1-*) only carry macOS/Linux builds,
// so take the newest release that has the MSVC 2015 win64 installer.
export default defineShard(async () => {
	const { data: releases } = await githubClient.rest.repos.listReleases({
		owner: 'wkhtmltopdf',
		repo: 'packaging',
		per_page: 50,
	});
	for (const release of releases) {
		if (release.draft || release.prerelease) continue;
		const asset = release.assets.find((a) => /^wkhtmltox-.+\.msvc2015-win64\.exe$/.test(a.name));
		if (!asset) continue;
		return {
			version: release.tag_name.replace(/^v/, ''),
			urls: () => [asset.browser_download_url],
			releaseNotes: { source: 'github', owner: 'wkhtmltopdf', repo: 'packaging', tag: release.tag_name, cleanup: false },
		};
	}
	throw new Error('No wkhtmltox msvc2015-win64 installer found in recent releases');
});

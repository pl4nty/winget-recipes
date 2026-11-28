import { defineShard } from 'anthelion';
import { githubClient } from 'anthelion/github';

// Master (N-) builds are only attached to some autobuild releases, and the
// PackageVersion joins the build name with the autobuild date.
export default defineShard(async () => {
	const { data: releases } = await githubClient.rest.repos.listReleases({ owner: 'defisym', repo: 'FFmpeg-Builds-Win32', per_page: 50 });
	for (const release of releases) {
		if (release.draft || release.prerelease) continue;
		const date = /^autobuild-(\d{4})-(\d{2})-(\d{2})-/.exec(release.tag_name);
		if (!date) continue;
		const asset = release.assets.find((item) => /^ffmpeg-N-\d+-g[0-9a-f]+-win32-lgpl\.zip$/.test(item.name));
		if (!asset) continue;
		const build = /^ffmpeg-(N-\d+-g[0-9a-f]+)-/.exec(asset.name)![1];
		return {
			version: `${build}-${date[1]}${date[2]}${date[3]}`,
			urls: () => [asset.browser_download_url],
		};
	}
	throw new Error('No master build found in recent autobuild releases');
});

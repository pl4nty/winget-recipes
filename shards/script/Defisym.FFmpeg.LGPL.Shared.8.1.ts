import { defineShard } from 'anthelion';
import { githubClient } from 'anthelion/github';

// The repo publishes a build every day but keeps only the last build of each month
// (older daily releases are deleted), and upstream tracks those month-end builds.
// PackageVersion is the FFmpeg release from the asset name plus the build date.
const owner = 'defisym';
const repo = 'FFmpeg-Builds-Win32';
const asset = /^ffmpeg-n(\d+\.\d+(?:\.\d+)*)-\d+-g[0-9a-f]+-win32-lgpl-shared-8\.1\.zip$/;

export default defineShard(async () => {
	const { data: releases } = await githubClient.rest.repos.listReleases({ owner, repo, per_page: 100 });
	for (const release of releases) {
		const date = /^autobuild-(\d{4})-(\d{2})-(\d{2})-\d{2}-\d{2}$/.exec(release.tag_name);
		if (release.draft || release.prerelease || !date) continue;
		const [, year, month, day] = date;
		const lastDay = new Date(Date.UTC(Number(year), Number(month), 0)).getUTCDate();
		if (Number(day) !== lastDay) continue;
		const file = release.assets.find(({ name }) => asset.test(name));
		if (!file) continue;
		const ffmpeg = asset.exec(file.name)![1];
		return {
			version: `${ffmpeg}-${year}${month}${day}`,
			urls: () => [file.browser_download_url],
			releaseNotes: { source: 'github', owner, repo, tag: release.tag_name, cleanup: false },
		};
	}
	throw new Error('No month-end FFmpeg 8.1 LGPL shared build found');
});

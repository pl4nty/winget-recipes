import { defineShard } from 'anthelion';
import { githubClient } from 'anthelion/github';
import { match } from 'anthelion/helpers';

// Daily autobuild releases (autobuild-YYYY-MM-DD-HH-MM) carry the FFmpeg release
// in the asset name; upstream versions are <ffmpeg version>-<build date>.
export default defineShard(async () => {
	const { data: releases } = await githubClient.rest.repos.listReleases({
		owner: 'defisym',
		repo: 'FFmpeg-Builds-Win32',
		per_page: 30,
	});
	const assetRegex = /^ffmpeg-n(\d+(?:\.\d+)+)(?:-\d+-g[0-9a-f]+)?-win32-gpl-8\.1\.zip$/;
	for (const release of releases) {
		if (release.draft || release.prerelease) continue;
		const date = /^autobuild-(\d{4})-(\d{2})-(\d{2})-\d{2}-\d{2}$/.exec(release.tag_name);
		if (!date) continue;
		const asset = release.assets.find((a) => assetRegex.test(a.name));
		if (!asset) throw new Error(`No win32 8.1 zip in ${release.tag_name}`);
		const {
			groups: [ffmpegVersion],
		} = match(asset.name, assetRegex);
		return {
			version: `${ffmpegVersion}-${date[1]}${date[2]}${date[3]}`,
			urls: () => [asset.browser_download_url],
			releaseNotes: { releaseNotesUrl: release.html_url },
		};
	}
	throw new Error('No autobuild release with a win32 gpl 8.1 zip found');
});

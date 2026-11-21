import { defineShard } from 'anthelion';
import { githubClient } from 'anthelion/github';
import { match } from 'anthelion/helpers';

// The repo publishes a build every day and keeps only the last build of each month long term.
// Upstream follows those monthly builds, so take the newest build of the last completed month.
export default defineShard(async () => {
	const { data: releases } = await githubClient.rest.repos.listReleases({
		owner: 'defisym',
		repo: 'FFmpeg-Builds-Win32',
		per_page: 100,
	});
	const builds = releases
		.filter((release) => !release.draft && /^autobuild-\d{4}-\d{2}-\d{2}-\d{2}-\d{2}$/.test(release.tag_name))
		.sort((a, b) => b.tag_name.localeCompare(a.tag_name));
	const month = (tag: string) => tag.slice('autobuild-'.length, 'autobuild-YYYY-MM'.length);
	const current = new Date().toISOString().slice(0, 'YYYY-MM'.length);
	const release = builds.find((build) => month(build.tag_name) < current);
	if (!release) throw new Error('No autobuild release from a completed month found');

	const asset = release.assets.find((asset) => /^ffmpeg-n7\.1\.\d+-\d+-g[0-9a-f]+-win32-lgpl-7\.1\.zip$/i.test(asset.name));
	if (!asset) throw new Error(`No win32-lgpl-7.1 asset on ${release.tag_name}`);
	const {
		groups: [ffmpeg],
	} = match(asset.name, /^ffmpeg-n(\d+(?:\.\d+)+)-/i);
	const {
		groups: [year, mon, day],
	} = match(release.tag_name, /^autobuild-(\d{4})-(\d{2})-(\d{2})-/);

	return {
		version: `${ffmpeg}-${year}${mon}${day}`,
		urls: () => [asset.browser_download_url],
		releaseNotes: { releaseNotesUrl: release.html_url },
	};
});

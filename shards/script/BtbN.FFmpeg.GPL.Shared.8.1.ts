import { defineShard } from 'anthelion';
import { githubClient } from 'anthelion/github';

const pattern = /^ffmpeg-n(8\.1(?:\.\d+)*)-\d+-g[0-9a-f]+-win64-gpl-shared-8\.1\.zip$/;

export default defineShard(async () => {
	const { data: releases } = await githubClient.rest.repos.listReleases({ owner: 'BtbN', repo: 'FFmpeg-Builds', per_page: 100 });
	// Upstream tracks the month-end builds, which BtbN keeps permanently.
	const release = releases.find((release) => {
		const date = /^autobuild-(\d{4})-(\d{2})-(\d{2})-/.exec(release.tag_name);
		return date && new Date(Date.UTC(Number(date[1]), Number(date[2]) - 1, Number(date[3]) + 1)).getUTCDate() === 1;
	});
	const name = release?.assets.map((asset) => asset.name).find((name) => pattern.test(name));
	if (!release || !name) throw new Error('No month-end build found');
	const date = release.tag_name.slice(10, 20).replaceAll('-', '');
	const base = `https://github.com/BtbN/FFmpeg-Builds/releases/download/${release.tag_name}`;
	const nestedInstallerMatches = ['/bin/ffmpeg.exe', '/bin/ffplay.exe', '/bin/ffprobe.exe'];

	return {
		version: `${pattern.exec(name)![1]}-${date}`,
		urls: () => [
			{ url: `${base}/${name}`, nestedInstallerMatches },
			{ url: `${base}/${name.replace('-win64-', '-winarm64-')}`, nestedInstallerMatches },
		],
		releaseNotes: {
			releaseNotesUrl: `https://github.com/BtbN/FFmpeg-Builds/releases/tag/${release.tag_name}`,
		},
	};
});

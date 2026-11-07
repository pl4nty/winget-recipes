import { defineShard } from 'anthelion';
import { getLatestRelease, getReleaseByTag, githubClient } from 'anthelion/github';

const owner = 'Beep6581';
const repo = 'RawTherapee';
const tag = 'nightly-github-actions';

// Rolling nightly release. Upstream versions are `git describe` strings (5.12-166-g7bae1495c):
// latest stable tag, commits since it, and the abbreviated commit of the nightly tag.
export default defineShard(async () => {
	const nightly = await getReleaseByTag({ owner, repo, tag });
	const asset = nightly.assets.find((a) => /^RawTherapee_dev_(?:.+_)?win64_(?:x86_64_)?release\.exe$/i.test(a.name));
	if (!asset) {
		throw new Error('No win64 release installer in the nightly release');
	}

	const named = /^RawTherapee_dev_(\d+\.\d+(?:\.\d+)?-\d+-g[0-9a-f]+)_win64_(?:x86_64_)?release\.exe$/i.exec(asset.name)?.[1];
	let version = named;
	if (!version) {
		const { rawTag: base } = await getLatestRelease({ owner, repo, kind: 'stable' });
		const { data: commit } = await githubClient.rest.repos.getCommit({ owner, repo, ref: tag });
		const { data: compare } = await githubClient.rest.repos.compareCommits({ owner, repo, base, head: commit.sha });
		version = `${base}-${compare.ahead_by}-g${commit.sha.slice(0, 9)}`;
	}

	return {
		version,
		urls: () => [asset.browser_download_url],
		releaseNotes: {
			releaseNotesUrl: nightly.html_url,
		},
	};
});

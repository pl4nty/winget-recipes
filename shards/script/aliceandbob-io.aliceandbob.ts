import { defineShard } from 'anthelion';
import { githubClient } from 'anthelion/github';
import { compareVersions } from 'anthelion/helpers';

// The vendor marks its betas as full releases and published v1.0.0 after 1.1.0-beta.2, so take the
// highest tag rather than the newest release. winget-pkgs writes 1.1.0-beta.2 as 1.1.0-Beta2 and the
// assets as 1.1.0-Beta.2.
export default defineShard(async () => {
	const { data: releases } = await githubClient.rest.repos.listReleases({
		owner: 'aliceandbob-io',
		repo: 'aliceandbob-desktop',
		per_page: 100,
	});
	const tags = releases.filter((release) => !release.draft).map((release) => release.tag_name);
	const tag = tags.sort((a, b) => compareVersions(a.replace(/^v/, ''), b.replace(/^v/, ''))).at(-1);
	if (!tag) throw new Error('No aliceandbob.io release found');
	const release = tag.replace(/^v/, '');
	const asset = release.replace(/-beta\./i, '-Beta.');
	const base = `https://github.com/aliceandbob-io/aliceandbob-desktop/releases/download/${tag}/aliceandbob.io-${asset}`;

	return {
		version: release.replace(/-beta\./i, '-Beta'),
		urls: () => [`${base}_x32.Setup.exe`, `${base}_x64.Setup.exe`],
		releaseNotes: { releaseNotesUrl: `https://github.com/aliceandbob-io/aliceandbob-desktop/releases/tag/${tag}` },
	};
});

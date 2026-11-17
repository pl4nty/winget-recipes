import { defineShard } from 'anthelion';
import { getLatestRelease } from 'anthelion/github';
import { match } from 'anthelion/helpers';

// Recly publishes every build as a GitHub prerelease tagged v<app>-build.<n>, and
// the attached MSI carries the installer version (Recly-<version>.msi) that WinGet uses.
const MSI = /\/Recly-(\d+(?:\.\d+)+)\.msi$/i;

export default defineShard(async () => {
	const release = await getLatestRelease({ owner: 'rokrokss', repo: 'recly', kind: 'all', assetRegex: '^Recly-\\d+(?:\\.\\d+)+\\.msi$' });
	const url = release.urls().find((url) => MSI.test(url));
	const {
		groups: [version],
	} = match(url, MSI);

	return {
		version,
		urls: () => [url],
	};
});

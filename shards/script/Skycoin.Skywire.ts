import { defineShard } from 'anthelion';
import { getLatestRelease } from 'anthelion/github';
import { match } from 'anthelion/helpers';

// Upstream keeps the leading "v" in PackageVersion (v1.3.34), which JSON shards
// strip, so take the raw tag as the version.
export default defineShard(async () => {
	const release = await getLatestRelease({ owner: 'skycoin', repo: 'skywire' });
	const version = match(release.rawTag, /^(v\d+(?:\.\d+)+)$/).groups[0];
	const base = `https://github.com/skycoin/skywire/releases/download/${release.rawTag}`;

	return {
		version,
		urls: () => [
			`${base}/skywire-installer-${version}-windows-386.msi`,
			`${base}/skywire-installer-${version}-windows-amd64.msi`,
			`${base}/skywire-installer-${version}-windows-arm64.msi`,
		],
	};
});

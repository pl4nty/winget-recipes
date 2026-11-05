import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';

type Release = { tag_name: string; assets: { name: string }[] };

// The package version carries the build number (2.4.1.2444), which only
// appears in the release asset names, not in the tag (v2.4.1).
export default defineShard(async () => {
	const response = await fetch('https://api.github.com/repos/simple-acme/simple-acme/releases/latest', {
		headers: {
			Accept: 'application/vnd.github+json',
			...(process.env.GITHUB_TOKEN && { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` }),
		},
	});
	if (!response.ok) throw new Error(`Failed to get the latest simple-acme release: ${response.status}`);
	const release = (await response.json()) as Release;

	const asset = release.assets.find((a) => /^simple-acme\.v[\d.]+\.win-x64\.pluggable\.zip$/.test(a.name));
	if (!asset) throw new Error(`Release ${release.tag_name} has no win-x64 pluggable zip`);
	const version = match(asset.name, /^simple-acme\.v(\d+(?:\.\d+)+)\.win-x64/).groups[0];
	const base = `https://github.com/simple-acme/simple-acme/releases/download/${release.tag_name}`;

	return {
		version,
		urls: () =>
			['x86', 'x64', 'arm64'].map((arch) => `${base}/simple-acme.v${version}.win-${arch}.pluggable.zip`),
		releaseNotes: {
			source: 'github',
			owner: 'simple-acme',
			repo: 'simple-acme',
			tag: release.tag_name,
		},
	};
});

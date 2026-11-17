import { defineShard } from 'anthelion';
import { compareVersions } from 'anthelion/helpers';

// swift.org lists every release with its platforms; take the newest one that
// ships a Windows toolchain.
type Release = {
	name: string;
	tag: string;
	platforms: { platform: string }[];
};

export default defineShard(async () => {
	const releases: Release[] = await fetch('https://www.swift.org/api/v1/install/releases.json').then((response) =>
		response.json(),
	);
	const release = releases
		.filter((r) => /^\d+(?:\.\d+)+$/.test(r.name) && r.platforms.some((p) => p.platform === 'Windows'))
		.sort((a, b) => compareVersions(a.name, b.name))
		.at(-1);
	if (!release) throw new Error('No Swift release with a Windows toolchain found');
	const version = release.name;
	const base = `https://download.swift.org/${release.tag.toLowerCase()}`;

	return {
		version,
		urls: () => [
			`${base}/windows10/${release.tag}/${release.tag}-windows10.exe`,
			`${base}/windows10-arm64/${release.tag}/${release.tag}-windows10-arm64.exe`,
		],
		releaseNotes: { releaseNotesUrl: `https://github.com/swiftlang/swift/releases/tag/${release.tag}` },
	};
});

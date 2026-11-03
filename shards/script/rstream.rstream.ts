import { defineShard } from 'anthelion';

type Package = { id: string; name: string; version: string; channel: string; os: string; arch: string };

// The vendor's package API lists builds newest first, and each build downloads
// from an opaque id, so the URLs come from the newest stable Windows release.
export default defineShard(async () => {
	const { packages } = (await fetch('https://rstream.io/api/packages').then((response) => response.json())) as {
		packages: Package[];
	};
	const windows = packages.filter(
		(entry) => entry.name === 'rstream' && entry.channel === 'stable' && entry.os === 'windows',
	);
	const version = windows[0]!.version;
	const build = (arch: string) => {
		const entry = windows.find((candidate) => candidate.version === version && candidate.arch === arch);
		if (!entry) throw new Error(`No ${arch} build for rstream ${version}`);
		return `https://rstream.io/api/packages/${entry.id}/download`;
	};

	return {
		version,
		urls: () => [
			{ url: build('x86_64'), architecture: 'x64' },
			{ url: build('arm64'), architecture: 'arm64' },
			{ url: build('x86_i686'), architecture: 'x86' },
		],
	};
});

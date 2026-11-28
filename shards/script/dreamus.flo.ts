import { defineShard } from 'anthelion';

// The FLO release API still reports 1.0.7, but newer builds (2.0.0) sit next to it in the same CDN folder,
// so start from the API version and step up through the next major/minor/patch builds that exist on the CDN.
const installer = (version: string) => `https://cdn.music-flo.com/poc/p/misc/player/latest/FLO_v${version}_win_release.exe`;
const exists = async (version: string) => (await fetch(installer(version), { method: 'HEAD' })).ok;

export default defineShard(async () => {
	const release = (await fetch('https://api.music-flo.com/external/v1/electron/release').then((response) => response.json())) as {
		data?: { latestVersion?: string };
	};
	let version = release.data?.latestVersion;
	if (!version || !/^\d+\.\d+\.\d+$/.test(version)) throw new Error('No FLO version in the release API');

	for (let step = 0; step < 20; step++) {
		const [major, minor, patch] = version.split('.').map(Number) as [number, number, number];
		const candidates = [`${major + 1}.0.0`, `${major}.${minor + 1}.0`, ...[1, 2, 3].map((n) => `${major}.${minor}.${patch + n}`)];
		let next: string | undefined;
		for (const candidate of candidates)
			if (await exists(candidate)) {
				next = candidate;
				break;
			}
		if (!next) break;
		version = next;
	}

	const latest = version;
	return {
		version: latest,
		urls: () => [installer(latest)],
	};
});

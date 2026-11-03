import { defineShard } from 'anthelion';

// geekbench.com is behind a Cloudflare challenge, so probe the vendor CDN instead.
const installerUrl = (version: string) =>
	`https://cdn.geekbench.com/GeekbenchAI-${version}-WindowsSetup.exe`;

const exists = async (version: string) =>
	(await fetch(installerUrl(version), { method: 'HEAD' })).ok;

export default defineShard(async () => {
	let [major, minor, patch] = [1, 0, 0];
	for (;;) {
		if (await exists(`${major + 1}.0.0`)) {
			[major, minor, patch] = [major + 1, 0, 0];
		} else if (await exists(`${major}.${minor + 1}.0`)) {
			[minor, patch] = [minor + 1, 0];
		} else if (await exists(`${major}.${minor + 2}.0`)) {
			[minor, patch] = [minor + 2, 0];
		} else if (await exists(`${major}.${minor}.${patch + 1}`)) {
			patch += 1;
		} else {
			break;
		}
	}
	const version = `${major}.${minor}.${patch}`;

	return {
		version,
		urls: () => [installerUrl(version)],
	};
});

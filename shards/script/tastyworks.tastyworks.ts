import { defineShard } from 'anthelion';
import { githubClient } from 'anthelion/github';
import { compareVersions } from 'anthelion/helpers';

// tastytrade publishes no version feed or listing: the desktop page builds its download
// link in the browser, and download.tastytrade.com only answers for existing files.
// So start from the newest version in winget-pkgs and probe the next patch, minor and
// major releases until none of them exists.
const url = (version: string) =>
	`https://download.tastytrade.com/desktop-${version.split('.')[0]}.x.x/${version}/tastytrade-${version}.msi`;

const exists = async (version: string) =>
	(await fetch(url(version), { method: 'HEAD' })).ok;

export default defineShard(async () => {
	const { data } = await githubClient.rest.repos.getContent({
		owner: 'microsoft',
		repo: 'winget-pkgs',
		path: 'manifests/t/tastyworks/tastyworks',
	});
	if (!Array.isArray(data)) throw new Error('Unexpected winget-pkgs listing');
	let version = data
		.filter((entry) => entry.type === 'dir' && /^\d+\.\d+\.\d+$/.test(entry.name))
		.map((entry) => entry.name)
		.sort(compareVersions)
		.at(-1);
	if (!version) throw new Error('No tastyworks versions in winget-pkgs');

	for (;;) {
		const [major, minor, patch] = version.split('.').map(Number) as [number, number, number];
		const candidates = [`${major}.${minor}.${patch + 1}`, `${major}.${minor + 1}.0`, `${major + 1}.0.0`];
		let next: string | undefined;
		for (const candidate of candidates) {
			if (await exists(candidate)) {
				next = candidate;
				break;
			}
		}
		if (!next) break;
		version = next;
	}

	return {
		version,
		urls: () => [url(version)],
	};
});

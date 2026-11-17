import { defineShard } from 'anthelion';
import { githubClient } from 'anthelion/github';
import { compareVersions } from 'anthelion/helpers';

const url = (version: string) =>
	`https://www.colorlogic.de/Seiten/Download/ZePrA-${version}-win-x64.zip`;

const exists = async (version: string) => (await fetch(url(version), { method: 'HEAD' })).ok;

// The vendor publishes each release under its own versioned path with no public index (only the newest builds stay online), so start
// from the newest version in winget-pkgs and probe the next patch, minor and major releases.
export default defineShard(async () => {
	const { data } = await githubClient.rest.repos.getContent({
		owner: 'microsoft',
		repo: 'winget-pkgs',
		path: 'manifests/c/ColorLogic/ZePrA',
	});
	if (!Array.isArray(data)) throw new Error('unexpected winget-pkgs listing');
	let version = data
		.filter((entry) => entry.type === 'dir')
		.map((entry) => entry.name)
		.toSorted(compareVersions)
		.at(-1);
	if (!version) throw new Error('no ColorLogic.ZePrA version in winget-pkgs');

	for (let found = true; found; ) {
		found = false;
		const [major = 0, minor = 0, patch = 0] = version.split('.').map(Number);
		for (const next of [`${major}.${minor}.${patch + 1}`, `${major}.${minor + 1}.0`, `${major + 1}.0.0`]) {
			if (await exists(next)) {
				version = next;
				found = true;
				break;
			}
		}
	}
	if (!(await exists(version))) throw new Error(`${url(version)} is not available`);

	return {
		version,
		urls: () => [url(version)],
	};
});

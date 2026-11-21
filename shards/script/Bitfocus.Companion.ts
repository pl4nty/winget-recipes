import { defineShard } from 'anthelion';

// The Bitfocus API lists one package per target; the file names carry a build number and commit.
const latest = async (target: string): Promise<{ version: string; uri: string }> => {
	const { packages } = await fetch(
		`https://api.bitfocus.io/v1/product/companion/packages?limit=1&target=${target}`,
	).then((response) => response.json());
	return packages[0];
};

export default defineShard(async () => {
	const [x64, arm64] = await Promise.all([latest('win-x64'), latest('win-arm64')]);
	const version = x64.version.replace(/^v/, '');
	if (arm64.version !== x64.version) throw new Error(`win-arm64 is ${arm64.version}, win-x64 is ${x64.version}`);

	return {
		version,
		urls: () => [x64.uri, arm64.uri],
		releaseNotes: {
			source: 'github',
			owner: 'bitfocus',
			repo: 'companion',
			tag: `v${version}`,
		},
	};
});

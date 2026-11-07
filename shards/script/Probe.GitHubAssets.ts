import { defineShard } from 'anthelion';
import { githubClient } from 'anthelion/github';

const repos: Record<string, [string, string]> = {"5113": ["nathanwijaya", "FileID"], "5393": ["sewandev", "Reverbic"], "5658": ["novafabric", "novavoice"], "5894": ["yazanmwk", "TypeSymbol"], "2776a": ["singularity", "singularity"], "2776b": ["singularity", "singularity-windows"], "5129": ["MaxyMaxTheDev", "clear-clipboard"], "2211": ["kanakkholwal", "recast"], "3974": ["KinectToVR", "Amethyst-Releases"], "3974b": ["KinectToVR", "Amethyst"], "3494": ["chidiwilliams", "buzz"]};

export default defineShard(async () => {
	const out: Record<string, unknown> = {};
	await Promise.all(
		Object.entries(repos).map(async ([id, [owner, repo]]) => {
			try {
				const { data } = await githubClient.rest.repos.listReleases({ owner, repo, per_page: 100 });
				out[id] = data.filter((r) => !r.draft).map((r) => ({ tag: r.tag_name, pre: r.prerelease, assets: r.assets.map((a) => a.name) }));
			} catch (error) {
				out[id] = String(error);
			}
		}),
	);
	console.log('PROBE-BEGIN');
	console.log(JSON.stringify(out));
	console.log('PROBE-END');
	throw new Error('probe only');
});

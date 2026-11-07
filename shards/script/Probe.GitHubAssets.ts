import { defineShard } from 'anthelion';
import { githubClient } from 'anthelion/github';

const repos: Record<string, [string, string]> = {"5748": ["openvpi", "OpenSvip"], "5146": ["Tinman-FP", "TinManX1"], "151": ["microsoft", "MIDI"], "4029": ["picguard", "picguard"], "2580": ["dpzxfuture", "dpzxgit1"], "2880": ["ghostersk", "ftp-server-gui"], "5212": ["SamarthAgrawal-002", "ShrinkIt"], "3512": ["geneb", "XREF"], "464": ["microsoft", "idfix"], "5748b": ["openvpi", "opensvip-converter"], "5146b": ["Tinman-FP", "TinManX1-Releases"]};

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

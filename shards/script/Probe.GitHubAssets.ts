import { defineShard } from 'anthelion';
import { githubClient } from 'anthelion/github';

const repos: Record<string, [string, string]> = {"justquery": ["votinvv", "justquery"], "rytunex": ["rayenghanmi", "RyTuneX"], "cmdpal": ["davidegiacometti", "CmdPal-Extensions"], "due2": ["myiam-io", "homebrew-tap"], "makestar": ["makestarlab", "makestar-admin-cli-releases"], "tiwut": ["tiwut", "Tiwut-Launcher-Windows"]};

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

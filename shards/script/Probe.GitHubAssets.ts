import { defineShard } from 'anthelion';
import { githubClient } from 'anthelion/github';

const repos: Record<string, [string, string]> = {"864": ["AariyJP", "ai-switcher"], "4017": ["mrenanpx", "appyama-novo"], "4805": ["solnsu", "StarBox_AITools"], "5165": ["tristan666666", "agent-island"], "5434": ["zack-zzq", "skillmux"], "5780": ["29thnight", "PrSM"], "4301": ["bonnie-boni", "CLI_stream"], "4646": ["bsnes-emu", "bsnes"], "167": ["microsoft", "MIDI"], "1553": ["owasp-amass", "amass"], "4036": ["picguard", "picguard"], "3513": ["DosWorld", "abmaze"]};

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
	for (const owner of ['AariyJP', 'mrenanpx', 'solnsu', 'tristan666666', '29thnight']) {
		try {
			const { data } = await githubClient.rest.repos.listForUser({ username: owner, per_page: 100 });
			out[`user:${owner}`] = data.map((r) => r.name);
		} catch (error) {
			out[`user:${owner}`] = String(error);
		}
	}
	console.log('PROBE-BEGIN');
	console.log(JSON.stringify(out));
	console.log('PROBE-END');
	throw new Error('probe only');
});

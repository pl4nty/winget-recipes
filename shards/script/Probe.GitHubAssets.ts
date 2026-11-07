import { defineShard } from 'anthelion';
import { githubClient } from 'anthelion/github';

const repos: Record<string, [string, string]> = {"mcad": ["kittech197718", "MCAD2026-releases"], "jq": ["votinvv", "justquery"], "elpl": ["mujtabaishaq5", "homebrew-elpl"], "bt": ["peterandree", "BTChargeTrayWatcher"], "sq": ["squigit-org", "squigit"], "ascu": ["TechnicalSolutionsForBlind", "Advanced-System-Cleanup-Utility"], "cs": ["akasula09", "CodeSlimmer"], "sg": ["Xznder1984", "SpotGet"], "wf": ["wf-group", "wfview"], "ff": ["fafarunner", "fafarunner"], "df": ["daphnee-ovo", "dev-flow"], "d3": ["huxingyi", "dust3d"]};

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
	await Promise.all(
		["kittech197718", "votinvv", "mujtabaishaq5", "peterandree", "squigit-org", "TechnicalSolutionsForBlind", "daphnee-ovo"].map(async (owner) => {
			try {
				const { data } = await githubClient.rest.repos.listForUser({ username: owner, per_page: 100 });
				out[`owner:${owner}`] = data.map((r) => r.name);
			} catch (error) {
				out[`owner:${owner}`] = String(error);
			}
		}),
	);
	await Promise.all(
		Object.entries(repos).map(async ([id, [owner, repo]]) => {
			try {
				const { data } = await githubClient.rest.repos.get({ owner, repo });
				out[`repo:${id}`] = data.full_name;
			} catch (error) {
				out[`repo:${id}`] = String(error);
			}
		}),
	);
	console.log('PROBE-BEGIN');
	console.log(JSON.stringify(out));
	console.log('PROBE-END');
	throw new Error('probe only');
});

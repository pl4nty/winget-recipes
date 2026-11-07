import { defineShard } from 'anthelion';
import { githubClient } from 'anthelion/github';

const repos: Record<string, [string, string]> = {"5032": ["rayenghanmi", "RyTuneX"], "4220": ["kittech197718", "MCAD2026-releases"], "5255": ["ydbilgin", "windows-care-kit"], "5619": ["philberndt", "GPTranslate"], "5938": ["objz", "rmcl"], "2299": ["jazzdelightsme", "PowershellStub"], "4485": ["gsmitheidw", "iotop-w"], "3537": ["picguard", "picguard"], "4577": ["lucianbumb", "MarkdownViewer"], "2089": ["yyqh01", "reaper_yyqh_plugins"], "3511": ["diskuv", "dk"]};
const users = ["kittech197718", "ydbilgin", "objz", "philberndt", "yyqh01"];

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
		users.map(async (u) => {
			try {
				const { data } = await githubClient.rest.repos.listForUser({ username: u, per_page: 100 });
				out['user:' + u] = data.map((r) => r.full_name);
			} catch (error) {
				out['user:' + u] = String(error);
			}
		}),
	);
	console.log('PROBE-BEGIN');
	console.log(JSON.stringify(out));
	console.log('PROBE-END');
	throw new Error('probe only');
});

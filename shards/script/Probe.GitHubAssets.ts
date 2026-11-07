import { defineShard } from 'anthelion';
import { githubClient } from 'anthelion/github';

const repos: Record<string, [string, string]> = {"3330": ["racemo-dev", "racemo-client"], "4070": ["ronnikols", "SNBT-AI-Localizer"], "4235": ["Yovancas", "claudebar-win"], "4253": ["stoplightio", "prism"], "5046": ["tbillington", "kondo"], "5076": ["RangS-1", "Ferminal"], "5220": ["MazeratorGame", "Mazerator"], "5339": ["u14app", "neo-chat"], "5434": ["zack-zzq", "skillmux"], "5498": ["Hyeonjun0527", "discord-ai-network-bot"], "5894": ["yazanmwk", "TypeSymbol"], "5919": ["RaphGL", "Tuckr"], "5938": ["objz", "rmcl"], "5989": ["1930-dev", "azure-vpn-cli"], "5997": ["product-noob", "launchpad-app"], "5843": ["Nbc66", "VTFEdit-Reloaded"], "5656": ["squigit-org", "squigit"]};

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

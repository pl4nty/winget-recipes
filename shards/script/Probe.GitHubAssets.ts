import { defineShard } from 'anthelion';
import { githubClient } from 'anthelion/github';

const repos: Record<string, [string, string]> = {"claudebar": ["Yovancas", "claudebar-win"], "prism": ["stoplightio", "prism"], "holdkey": ["Noxxider", "holdkey-releases"], "kondo": ["tbillington", "kondo"], "ferminal": ["RangS-1", "Ferminal"], "neochat": ["u14app", "neo-chat"], "skillmux": ["zack-zzq", "skillmux"], "dainb": ["Hyeonjun0527", "discord-ai-network-bot"], "openmw": ["OpenMW", "openmw"], "msixcmd": ["bergerpascal", "MSIX_Commander"], "typesymbol": ["yazanmwk", "TypeSymbol"], "tuckr": ["RaphGL", "Tuckr"], "sefirah": ["shrimqy", "Sefirah"], "whois": ["Akaere-NetWorks", "whois"], "yahb": ["asdfjkl", "yahb"], "smartsub": ["buxuku", "SmartSub"]};

export default defineShard(async () => {
	const out: Record<string, unknown> = {};
	await Promise.all(
		Object.entries(repos).map(async ([id, [owner, repo]]) => {
			try {
				const { data } = await githubClient.rest.repos.listReleases({ owner, repo, per_page: 30 });
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

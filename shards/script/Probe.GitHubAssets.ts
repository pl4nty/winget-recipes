import { defineShard } from 'anthelion';
import { githubClient } from 'anthelion/github';

const repos: Record<string, [string, string]> = {"150": ["microsoft", "MIDI"], "2697": ["AariyJP", "VRCXF"], "5112": ["SocioProphet", "Noetica"], "5883": ["miangee21", "Msgify-Lite"], "2197": ["Hybrid-Solutions-Cloud", "vault-prospector-releases"], "4150": ["webtorrent", "webtorrent-desktop"], "5751": ["Beep6581", "RawTherapee"], "4191": ["x86matthew", "WoWMIPS"], "5656": ["squigit-org", "squigit"]};

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

import { defineShard } from 'anthelion';
import { githubClient } from 'anthelion/github';

const repos: Record<string, [string, string]> = {"aztf": ["Azure", "aztfexport"], "amse": ["Azure", "Azure-Media-Services-Explorer"], "midi": ["microsoft", "MIDI"], "idfix": ["microsoft", "idfix"], "aisw": ["AariyJP", "ai-switcher"], "vrcxf": ["AariyJP", "VRCXF"], "mini": ["conda-forge", "miniforge"], "cowork": ["AIDotNet", "NextCoWork"], "racemo": ["racemo-dev", "racemo-client"], "yama": ["mrenanpx", "appyama-novo"], "wall": ["rishabh3354", "4KWALL"], "snbt": ["ronnikols", "SNBT-AI-Localizer"]};

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

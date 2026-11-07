import { defineShard } from 'anthelion';
import { githubClient } from 'anthelion/github';

const repos: Record<string, [string, string]> = {"1569": ["conda-forge", "miniforge"], "4066": ["tuanle96", "devclean"], "4914": ["TanmoyTheBoT", "homework-answer-bot"], "4914b": ["TanmoyTheBoT", "pydm"], "5220": ["MazeratorGame", "Mazerator"], "5498": ["Hyeonjun0527", "discord-ai-network-bot"], "5843": ["Nbc66", "VTFEdit-Reloaded"], "5927": ["Promethyxx", "oxyon"], "4987": ["webyog", "sqlyog-community"], "5465": ["porrey", "Virtual-ZPL-Printer"], "1934": ["symless", "synergy"], "1934b": ["deskflow", "deskflow"]};

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

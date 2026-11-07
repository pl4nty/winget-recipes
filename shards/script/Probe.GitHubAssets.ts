import { defineShard } from 'anthelion';
import { githubClient } from 'anthelion/github';

const repos: Record<string, [string, string]> = {"smapp": ["spacemeshos", "smapp"], "midi": ["microsoft", "MIDI"], "opensvip": ["SineStriker", "OpenSvip"], "sqlyog": ["webyog", "sqlyog-community"], "amass": ["owasp-amass", "amass"], "dolphin": ["dolphin-emu", "dolphin"], "miniforge": ["conda-forge", "miniforge"], "virtviewer": ["virt-manager", "virt-viewer"], "cubic": ["cjcliffe", "CubicSDR"], "devflow": ["daphnee-ovo", "dev-flow"], "aztfexport": ["Azure", "aztfexport"], "tuitest": ["microsoft", "tui-test"], "ams": ["Azure", "Azure-Media-Services-Explorer"]};

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

import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';

// wg.accellence.eu has no index. Each release series has build-generated release notes that start with
// "Changelog for <series>, since <previous build>", and vimacc.de names a public series no newer than it.
const BASE = 'https://wg.accellence.eu/vimacc';
const exists = async (url: string) => (await fetch(url, { method: 'HEAD' })).ok;

export default defineShard(async () => {
	const page = await fetch('https://www.vimacc.de/en/downloads').then((response) => response.text());
	const {
		groups: [major, minor, publicSeries],
	} = match(page, />vimacc (\d+)\.(\d+)\.(\d+)</i, 'No vimacc series on vimacc.de');

	let series: string | undefined;
	let notes = '';
	for (let patch = Number(publicSeries); patch <= Number(publicSeries) + 10; patch++) {
		const candidate = `${major}.${minor}.${patch}`;
		const response = await fetch(`${BASE}/${candidate.replaceAll('.', '_')}/vimacc${candidate}_ReleaseNotes.txt`);
		if (!response.ok) continue;
		series = candidate;
		notes = await response.text();
	}
	if (!series) throw new Error('No vimacc release notes found on wg.accellence.eu');

	const since = /Changelog for [\d.]+, since \d+\.\d+\.\d+\.(\d+)/i.exec(notes);
	const installer = (build: number) => `${BASE}/${series.replaceAll('.', '_')}/vimaccEnterprise_${series}.${build}_x64_sign.exe`;
	let build = since ? Number(since[1]) + 1 : 0;
	if (!(await exists(installer(build)))) throw new Error(`No vimacc installer for ${series}.${build}`);
	while (await exists(installer(build + 1))) build++;
	const version = `${series}.${build}`;

	return {
		version,
		urls: () => [installer(build)],
		releaseNotes: { releaseNotesUrl: `${BASE}/${series.replaceAll('.', '_')}/vimacc${series}_ReleaseNotes.txt` },
	};
});

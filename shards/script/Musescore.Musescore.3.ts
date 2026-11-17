import { defineShard } from 'anthelion';
import { getLatestRelease } from 'anthelion/github';

// MuseScore 3 is the legacy 3.x line of musescore/MuseScore, and its MSI names carry the 4-part build version.
// MuseScore serves the same MSIs from its jsDelivr endpoint, which the manifests use.
export default defineShard(async () => {
	const release = await getLatestRelease({
		owner: 'musescore',
		repo: 'MuseScore',
		kind: 'stable',
		tagRegex: '^v(?=3\\.)',
		sortByVersion: true,
		perPage: 100,
	});
	const asset = (arch: string) => release.assets.find((a) => new RegExp(`^MuseScore-3(?:\\.\\d+)+-${arch}\\.msi$`).test(a.name));
	const x64 = asset('x86_64');
	const x86 = asset('x86');
	if (!x64 || !x86) throw new Error(`No MuseScore 3 MSI assets on ${release.rawTag}`);
	const version = x64.name.replace(/^MuseScore-/, '').replace(/-x86_64\.msi$/, '');

	return {
		version,
		urls: () => [x64, x86].map((a) => `https://cdn.jsdelivr.net/musescore/${release.rawTag}/${a.name}`),
		releaseNotes: { releaseNotesUrl: `https://github.com/musescore/MuseScore/releases/tag/${release.rawTag}` },
	};
});

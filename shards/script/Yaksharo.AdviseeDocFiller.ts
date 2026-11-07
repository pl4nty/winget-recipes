import { defineShard } from 'anthelion';
import { getLatestRelease } from 'anthelion/github';

// Upstream keeps the tag's `v` in PackageVersion (v1.01), which JSON shards strip.
// The asset name gained a `v` in v1.02 (AdviseeDocFiller-Setup-v1.02.exe), so match either form.
export default defineShard(async () => {
	const release = await getLatestRelease({ owner: 'Yaksharo', repo: 'appraisal-filler' });

	return {
		version: release.rawTag,
		urls: () => release.urls().filter((url) => /\/AdviseeDocFiller-Setup-v?\d+(?:\.\d+)*\.exe$/.test(url)),
		releaseNotes: { source: 'github', owner: 'Yaksharo', repo: 'appraisal-filler', tag: release.rawTag },
	};
});

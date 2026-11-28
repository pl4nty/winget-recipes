import { defineShard } from 'anthelion';
import { getLatestReleaseFromRedirect } from 'anthelion/github';
import { match } from 'anthelion/helpers';

// Upstream keeps the leading "v" in PackageVersion (v0.1.0), which JSON shards
// always strip, so the release tag is used as is.
export default defineShard(async () => {
	const { rawTag } = await getLatestReleaseFromRedirect({ owner: 'IDisposable', repo: 'sdio-go' });
	const {
		captures: { tag },
	} = match(rawTag, /^(?<tag>v\d+(?:\.\d+)+)$/, 'No stable SDIGo release found');

	return {
		version: tag,
		urls: () => [`https://github.com/IDisposable/sdio-go/releases/download/${tag}/sdigo.exe`],
		releaseNotes: { source: 'github', owner: 'IDisposable', repo: 'sdio-go', tag, cleanup: false },
	};
});

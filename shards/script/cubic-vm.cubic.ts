import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';

// Upstream keeps the leading "v" in PackageVersion (v0.27.0), which JSON shards
// always strip, so the latest release tag is read from GitHub's redirect as is.
export default defineShard(async () => {
	const response = await fetch('https://github.com/cubic-vm/cubic/releases/latest', { method: 'HEAD', redirect: 'manual' });
	const location = response.headers.get('location') ?? '';
	const {
		captures: { tag },
	} = match(location, /\/releases\/tag\/(?<tag>v\d+(?:\.\d+)+)$/, 'No stable cubic release found');

	return {
		version: tag,
		urls: () => [`https://github.com/cubic-vm/cubic/releases/download/${tag}/cubic-${tag}-windows-amd64.exe`],
		releaseNotes: { source: 'github', owner: 'cubic-vm', repo: 'cubic', tag, cleanup: false },
	};
});

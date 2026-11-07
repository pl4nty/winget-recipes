import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';

// Upstream keeps the leading "v" in PackageVersion (v1.0.34), which JSON shards
// always strip, so the latest release tag is read from GitHub's redirect as is.
export default defineShard(async () => {
	const response = await fetch('https://github.com/ratspeak/Ratspeak/releases/latest', { method: 'HEAD', redirect: 'manual' });
	const location = response.headers.get('location') ?? '';
	const {
		captures: { tag },
	} = match(location, /\/releases\/tag\/(?<tag>v\d+(?:\.\d+)+)$/, 'No stable Ratspeak release found');

	return {
		version: tag,
		urls: () => [
			`https://github.com/ratspeak/Ratspeak/releases/download/${tag}/Ratspeak-${tag}-windows-x64.msi`,
			`https://github.com/ratspeak/Ratspeak/releases/download/${tag}/Ratspeak-${tag}-windows-x64-setup.exe`,
		],
		releaseNotes: { source: 'github', owner: 'ratspeak', repo: 'Ratspeak', tag, cleanup: false },
	};
});

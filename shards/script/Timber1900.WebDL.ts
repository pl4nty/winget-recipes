import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';

// Upstream keeps the leading "v" in PackageVersion (v11.3.1), which JSON shards
// always strip, so the latest release tag is read from GitHub's redirect as is.
export default defineShard(async () => {
	const response = await fetch('https://github.com/Timber1900/WebDL/releases/latest', { method: 'HEAD', redirect: 'manual' });
	const location = response.headers.get('location') ?? '';
	const {
		captures: { tag },
	} = match(location, /\/releases\/tag\/(?<tag>v\d+(?:\.\d+)+)$/, 'No stable WebDL release found');

	return {
		version: tag,
		// Inno setup is a 32-bit stub; payload app/WebDL.exe is PE32+ x86-64.
		urls: () => [{ url: `https://github.com/Timber1900/WebDL/releases/download/${tag}/WebDL.exe`, architecture: 'x64' }],
		releaseNotes: { source: 'github', owner: 'Timber1900', repo: 'WebDL', tag, cleanup: false },
	};
});

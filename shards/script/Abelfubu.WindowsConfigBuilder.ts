import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';

// Upstream keeps the leading "v" in PackageVersion (v0.0.2), which JSON shards
// always strip, so the latest release tag is read from GitHub's redirect as is.
export default defineShard(async () => {
	const response = await fetch('https://github.com/abelfubu/windows-config-builder/releases/latest', {
		method: 'HEAD',
		redirect: 'manual',
	});
	const location = response.headers.get('location') ?? '';
	const {
		captures: { tag },
	} = match(location, /\/releases\/tag\/(?<tag>v\d+\.\d+\.\d+)$/, 'No stable windows-config-builder release found');

	return {
		version: tag,
		urls: () => [`https://github.com/abelfubu/windows-config-builder/releases/download/${tag}/windows-config-builder.exe`],
		releaseNotes: { source: 'github', owner: 'abelfubu', repo: 'windows-config-builder', tag, cleanup: false },
	};
});

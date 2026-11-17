import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';

// Upstream keeps the leading "v" in PackageVersion (v0.1.4), which JSON shards
// always strip, so the latest release tag is read from GitHub's redirect as is.
export default defineShard(async () => {
	const response = await fetch('https://github.com/mastermach50/mia-agent/releases/latest', {
		method: 'HEAD',
		redirect: 'manual',
	});
	const location = response.headers.get('location') ?? '';
	const {
		captures: { tag },
	} = match(location, /\/releases\/tag\/(?<tag>v\d+(?:\.\d+)+)$/, 'No stable mia-agent release found');

	return {
		version: tag,
		urls: () => [`https://github.com/mastermach50/mia-agent/releases/download/${tag}/mia-agent-windows-x86_64.zip`],
		releaseNotes: { source: 'github', owner: 'mastermach50', repo: 'mia-agent', tag, cleanup: false },
	};
});

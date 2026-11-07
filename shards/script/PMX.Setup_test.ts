import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';

// The latest release link redirects to a tag that is not the version; the version comes from the installer.
export default defineShard(async () => {
	const location = (await fetch('https://github.com/Drifter011/test/releases/latest/download/Setup_test.msi', { method: 'HEAD', redirect: 'manual' })).headers.get('location') ?? '';
	const url = match(location, /^(https:\/\/github\.com\/Drifter011\/test\/releases\/download\/[^/]+\/Setup_test\.msi)$/, `Unexpected redirect: ${location}`).groups[0];

	return { version: { source: 'display' }, urls: () => [url], state: url, replace: true };
});

import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';

// The downloads page lists FurMark 1 and FurMark 2 side by side; the FurMark 1
// column links to a /dl/show/<id> page whose /dl/get/<id> twin redirects to the setup.
export default defineShard(async () => {
	const page = await fetch('https://geeks3d.com/furmark/downloads/').then((response) => response.text());
	const section = page.slice(page.indexOf('>FurMark 1</div>'));
	const { id, version } = match(
		section,
		/href="\/dl\/show\/(?<id>\d+)"[^>]*>v(?<version>1\.\d+(?:\.\d+)+) - win32 - \(SETUP\)<\/a>/i,
	).captures;

	const response = await fetch(`https://geeks3d.com/dl/get/${id}`, { method: 'HEAD', redirect: 'manual' });
	const location = response.headers.get('location');
	if (!location) throw new Error(`No redirect for download ${id}`);

	return {
		version,
		urls: () => [location],
	};
});

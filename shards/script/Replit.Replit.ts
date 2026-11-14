import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';

// The vendor download URL is unversioned and redirects to the release asset,
// whose file name (Replit-<version>.Setup.exe) carries the version. Upstream
// keeps the unversioned URL, so the shard does too.
export default defineShard(async () => {
	const url = 'https://desktop.replit.com/download/windows';
	const response = await fetch(url, { redirect: 'manual' });
	const location = decodeURIComponent(response.headers.get('location') ?? '');
	const {
		captures: { version },
	} = match(location, /filename=Replit-(?<version>\d+(?:\.\d+)+)\.Setup\.exe/);

	return {
		version,
		urls: () => [url],
	};
});

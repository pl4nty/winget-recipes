import { defineShard } from 'anthelion';

// Upright Labs publishes versioned installers in a private S3 bucket with no
// listing, feed or public download page (the help page needs a login). The
// shard starts from a known released version and probes the next patch, minor
// and major versions with HEAD requests until none exists.
const base = 'https://s3.us-east-1.amazonaws.com/co.uprightlabs.lister/printing';
const url = (version: string, arch: string) =>
	`${base}/lister-connect-${version}-${arch}.exe`;
const exists = async (version: string) =>
	(await fetch(url(version, 'x86_64'), { method: 'HEAD' })).ok;

export default defineShard(async () => {
	let version = '2.3.0';
	for (;;) {
		const [major, minor, patch] = version.split('.').map(Number);
		const candidates = [
			`${major}.${minor}.${patch + 1}`,
			`${major}.${minor}.${patch + 2}`,
			`${major}.${minor + 1}.0`,
			`${major + 1}.0.0`,
		];
		let next: string | undefined;
		for (const candidate of candidates) {
			if (await exists(candidate)) {
				next = candidate;
				break;
			}
		}
		if (!next) break;
		version = next;
	}

	return {
		version,
		urls: () => [url(version, 'x86_64'), url(version, 'arm64')],
	};
});

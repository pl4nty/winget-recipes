import { defineShard } from 'anthelion';
import ky from 'ky';

// windows.php.net publishes releases.json keyed by branch ("8.4"), which JSON path lookups cannot
// address. Its version can carry a Windows rebuild suffix (8.x.y-1); the package version and the
// archived non-thread-safe zips the manifests carry use the plain PHP version. The toolset (vs17) is
// read from the build keys.
const branch = '8.4';
const base = 'https://downloads.php.net/~windows/releases';

export default defineShard(async () => {
	const releases = await ky(`${base}/releases.json`, { timeout: 60_000 }).json<
		Record<string, Record<string, unknown> & { version: string }>
	>();
	const release = releases[branch];
	if (!release) {
		throw new Error(`No PHP ${branch} entry in releases.json`);
	}
	const version = release.version.replace(/-\d+$/, '');
	const toolset = Object.keys(release)
		.map((key) => key.match(/^nts-(v[cs]\d+)-x64$/)?.[1])
		.find(Boolean);
	if (!toolset) {
		throw new Error(`No non-thread-safe x64 build for PHP ${branch}`);
	}

	return {
		version,
		urls: () => [
			`${base}/archives/php-${version}-nts-Win32-${toolset}-x64.zip`,
			`${base}/archives/php-${version}-nts-Win32-${toolset}-x86.zip`,
		],
		releaseNotes: {
			releaseNotesUrl: `https://www.php.net/ChangeLog-8.php#${version}`,
		},
	};
});

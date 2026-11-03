import { defineShard } from 'anthelion';
import ky from 'ky';

type Build = { zip: { path: string } };

export default defineShard(async () => {
	const releases = await ky('https://downloads.php.net/~windows/releases/releases.json').json<
		Record<string, Record<string, Build | string>>
	>();
	const branch = releases['8.3']!;
	// The feed appends -N for rebuilds (8.3.36-1); the package and archive files use the plain version.
	const version = String(branch.version).replace(/-\d+$/, '');
	const archive = (arch: 'x64' | 'x86') => {
		const key = Object.keys(branch).find((k) => new RegExp(`^ts-vs\\d+-${arch}$`).test(k));
		if (!key) throw new Error(`No thread-safe ${arch} build for PHP 8.3`);
		const toolset = key.split('-')[1];
		return `https://downloads.php.net/~windows/releases/archives/php-${version}-Win32-${toolset}-${arch}.zip`;
	};

	return {
		version,
		urls: () => [archive('x64'), archive('x86')],
		releaseNotes: {
			releaseNotesUrl: `https://www.php.net/ChangeLog-8.php#${version}`,
		},
	};
});

import { defineShard } from 'anthelion';

type Build = { zip?: { path: string } };
type Release = { version: string } & Record<string, Build | string>;

// Until 8.6.0 is released, the 8.6 branch is only in the QA feed. Afterwards the stable feed has it,
// and QA release candidates of later patch versions must not reach the stable package.
const BRANCH = '8.6';
const FEEDS = ['releases', 'qa'];

export default defineShard(async () => {
	for (const feed of FEEDS) {
		const releases = (await fetch(`https://downloads.php.net/~windows/${feed}/releases.json`).then((response) =>
			response.json(),
		)) as Record<string, Release>;
		const release = releases[BRANCH];
		if (!release) continue;
		const zip = (arch: string) => {
			const key = Object.keys(release).find((key) => key.startsWith('ts-') && key.endsWith(`-${arch}`));
			const path = key && (release[key] as Build).zip?.path;
			if (!path) throw new Error(`No PHP ${release.version} ${arch} build in the ${feed} feed`);
			return `https://downloads.php.net/~windows/${feed}/archives/${path}`;
		};
		// The stable feed appends a build number (8.5.12-1) that upstream versions leave out.
		const version = release.version.replace(/-\d+$/, '');

		return {
			version,
			urls: () => [zip('x64'), zip('x86')],
			releaseNotes: { releaseNotesUrl: `https://www.php.net/ChangeLog-8.php#${version.replace(/RC\d+$/i, '')}` },
		};
	}
	throw new Error(`No PHP ${BRANCH} release found`);
});

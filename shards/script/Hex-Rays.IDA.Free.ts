import { defineShard } from 'anthelion';

// IDA Free 9.x installers are only served to signed-in My Hex-Rays accounts (or hcli with an
// API key); there is no public download URL. The version comes from the public release notes.
export default defineShard(async () => {
	const page = await fetch('https://docs.hex-rays.com/release-notes').then((response) => response.text());
	const releases = [...page.matchAll(/href="\/release-notes\/(\d+)_(\d+)"/g)].map(([, major, minor]) => [
		Number(major),
		Number(minor),
	]);
	if (releases.length === 0) throw new Error('No release notes found');
	const [major, minor] = releases.sort((a, b) => b[0]! - a[0]! || b[1]! - a[1]!)[0]!;
	const version = `${major}.${minor}`;

	return {
		version,
		urls: () => {
			throw new Error(
				`IDA Free ${version} is only downloadable from My Hex-Rays after signing in; no public installer URL`,
			);
		},
		releaseNotes: {
			releaseNotesUrl: `https://docs.hex-rays.com/release-notes/${major}_${minor}`,
		},
	};
});

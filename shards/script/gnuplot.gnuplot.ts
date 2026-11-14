import { defineShard } from 'anthelion';
import { compareVersions } from 'anthelion/helpers';
import ky from 'ky';

// winget-pkgs versions gnuplot as "6.0 patchlevel 4", and the Windows installer's
// toolchain suffix changes between releases (mingw, clang), so read both from the feed.
export default defineShard(async () => {
	const feed = await ky('https://sourceforge.net/projects/gnuplot/rss?path=/gnuplot', {
		timeout: 60_000,
		retry: 3,
	}).text();

	const files = Array.from(
		feed.matchAll(/\/gnuplot\/(\d+\.\d+\.\d+)\/(gp\d+-(?:win64-[a-z0-9-]+|woa)\.exe)\/download/g),
		([, release, file]) => ({ release: release!, file: file! }),
	);
	const x64 = files
		.filter(({ file }) => file.includes('-win64-'))
		.sort((a, b) => compareVersions(b.release, a.release))[0];
	if (!x64) throw new Error('Failed to find a gnuplot Windows installer in the SourceForge feed');

	const { release } = x64;
	const arm64 = files.find((entry) => entry.release === release && entry.file.endsWith('-woa.exe'));
	const [major, minor, patch] = release.split('.');
	const url = (file: string) => `https://sourceforge.net/projects/gnuplot/files/gnuplot/${release}/${file}/download`;

	return {
		version: `${major}.${minor} patchlevel ${patch}`,
		urls: () => [
			{ url: url(x64.file), architecture: 'x64' as const },
			...(arm64 ? [{ url: url(arm64.file), architecture: 'arm64' as const }] : []),
		],
		releaseNotes: {
			releaseNotesUrl: `http://www.gnuplot.info/ReleaseNotes_${release.replaceAll('.', '_')}.html`,
		},
	};
});

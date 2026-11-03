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

	const [latest] = Array.from(
		feed.matchAll(/\/gnuplot\/(\d+\.\d+\.\d+)\/(gp\d+-win64-[a-z0-9-]+\.exe)\/download/g),
		([, release, file]) => ({ release: release!, file: file! }),
	).sort((a, b) => compareVersions(b.release, a.release));
	if (!latest) throw new Error('Failed to find a gnuplot Windows installer in the SourceForge feed');

	const { release, file } = latest;
	const [major, minor, patch] = release.split('.');

	return {
		version: `${major}.${minor} patchlevel ${patch}`,
		urls: () => [`https://sourceforge.net/projects/gnuplot/files/gnuplot/${release}/${file}/download`],
		releaseNotes: {
			releaseNotesUrl: `http://www.gnuplot.info/ReleaseNotes_${release.replaceAll('.', '_')}.html`,
		},
	};
});

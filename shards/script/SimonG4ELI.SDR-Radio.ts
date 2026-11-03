import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';
import ky from 'ky';

// The release notes page lists every build of the version, newest first, each under a
// "Version x.y Build n" heading. Only the newest build's section becomes the release notes.
async function newestBuildNotes(url: string) {
	const page = await ky(url, { timeout: 60_000 }).text();
	const heading = /<h1[^>]*>\s*<span[^>]*>Version \d+\.\d+ Build \d+[\s\S]*?<\/h1>/;
	const first = heading.exec(page);
	if (!first) {
		throw new Error('No "Version x.y Build n" heading on the SDR-Radio release notes page');
	}
	const start = first.index + first[0].length;
	const next = page.indexOf('<h1', start);
	return page.slice(start, next === -1 ? undefined : next);
}

// The "Release" section of the download page (before the "Beta" section) lists the current
// release: a 64-bit zip on the site's webhost, which the manifests use, plus 32-bit and 64-bit
// Dropbox exes. Dropbox share links carry random ids, so they are read from the page.
export default defineShard(async () => {
	const page = await ky('https://www.sdr-radio.com/download', {
		timeout: 60_000,
	}).text();
	const start = page.indexOf('id="Release"');
	const end = page.indexOf('id="Beta"', start);
	if (start === -1) {
		throw new Error('Release section not found on the SDR-Radio download page');
	}
	const section = page.slice(start, end === -1 ? undefined : end);

	const {
		captures: { zip, version },
	} = match(
		section,
		/href="(?<zip>https:\/\/irp\.cdn-website\.com\/[^"]+\/SDR-Radio(?: |%20)V(?<version>\d+\.\d+)[^"]*64-bit[^"]*\.zip)"/,
		'64-bit release zip not found',
	);
	const {
		captures: { x86 },
	} = match(
		section,
		new RegExp(
			`href="(?<x86>https:\\/\\/www\\.dropbox\\.com\\/scl\\/fi\\/[^"]+\\/SDR-Radio-V${version!.replace('.', '\\.')}-32-bit-[^"]+\\.exe\\?[^"]+)"`,
		),
		'32-bit release Dropbox exe not found',
	);
	const {
		captures: { notes },
	} = match(section, /href="(?<notes>\/v\d+-\d+-release-notes)"/, 'Release notes link not found');

	const releaseNotesUrl = `https://www.sdr-radio.com${notes}`;

	return {
		version: version!,
		urls: () => [
			{ url: encodeURI(decodeURI(zip!)), architecture: 'x64' as const },
			{
				url: x86!.replaceAll('&amp;', '&').replace(/([?&])dl=0\b/, '$1dl=1'),
				architecture: 'x86' as const,
			},
		],
		releaseNotes: {
			source: 'html',
			sourceUrl: `data:text/html,${encodeURIComponent(await newestBuildNotes(releaseNotesUrl))}`,
			releaseNotesUrl,
			cleanup: false,
		},
	};
});

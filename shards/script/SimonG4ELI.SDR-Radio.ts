import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';
import ky from 'ky';

// The "Release" section of the download page (before the "Beta" section) lists the current
// release: a 64-bit zip on the site's webhost, which the manifests use, plus 32-bit and 64-bit
// Dropbox exes. Dropbox share links carry random ids, so they are read from the page.
export default defineShard(async () => {
	const page = await ky('https://www.sdr-radio.com/download', { timeout: 60_000 }).text();
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
			releaseNotesUrl: `https://www.sdr-radio.com${notes}`,
		},
	};
});

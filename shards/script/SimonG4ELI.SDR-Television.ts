import { defineShard } from 'anthelion';
import { compareVersions } from 'anthelion/helpers';
import ky from 'ky';

// The DATV page links one page per release (/sdr-television-v1-1-7). The newest release page holds
// the 64-bit installer as a Dropbox share link with a random id, so it is read from that page; the
// page also links an SDR-Radio installer, which the filename filter skips.
const site = 'https://www.sdr-radio.com';

export default defineShard(async () => {
	const index = await ky(`${site}/datv`, { timeout: 60_000 }).text();
	const release = [...index.matchAll(/href="\/sdr-television-v(\d+(?:-\d+)+)"/g)]
		.map(([, slug]) => slug!.replaceAll('-', '.'))
		.sort(compareVersions)
		.at(-1);
	if (!release) {
		throw new Error('No SDR-Television release page found');
	}

	const page = await ky(`${site}/sdr-television-v${release.replaceAll('.', '-')}`, {
		timeout: 60_000,
	}).text();
	const link = page.match(
		/href="(https:\/\/www\.dropbox\.com\/scl\/fi\/[^"]+\/SDR-Television-v(\d+(?:\.\d+)+)-64-bit-[^"]+\.exe\?[^"]+)"/i,
	);
	if (!link) {
		throw new Error(`No 64-bit Dropbox link on the SDR-Television ${release} page`);
	}
	const url = link[1]!.replaceAll('&amp;', '&').replace(/([?&])dl=0\b/, '$1dl=1');

	return {
		version: link[2]!,
		urls: () => [url],
	};
});

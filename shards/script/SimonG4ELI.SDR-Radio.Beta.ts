import { defineShard } from 'anthelion';
import { compareVersions } from 'anthelion/helpers';
import ky from 'ky';

// The download page lists each beta as "Build NNNN" followed by its 32-bit and 64-bit links on
// Microsoft OneDrive and Dropbox. The package version is {major}.{build}, and the manifests carry
// the 64-bit Dropbox link with dl=1. Dropbox share links carry random ids, so they are read from the page.
export default defineShard(async () => {
	const page = await ky('https://www.sdr-radio.com/download', { timeout: 60_000 }).text();
	const builds = [...page.matchAll(/Build (\d{4,})/g)].flatMap((build) => {
		const rest = page.slice(build.index);
		const next = rest.slice(1).search(/Build \d{4,}/);
		const section = next === -1 ? rest : rest.slice(0, next + 1);
		const link = section.match(
			/href="(https:\/\/www\.dropbox\.com\/scl\/fi\/[^"]+\/SDR-Radio-V(\d+\.\d+)-64-bit-[^"]+\.exe\?[^"]+)"/,
		);
		return link ? [{ version: `${link[2]}.${build[1]}`, url: link[1]! }] : [];
	});
	const latest = builds.sort((a, b) => compareVersions(a.version, b.version)).at(-1);
	if (!latest) {
		throw new Error('No SDR-Radio beta build with a 64-bit Dropbox link found');
	}
	const url = latest.url.replaceAll('&amp;', '&').replace(/([?&])dl=0\b/, '$1dl=1');

	return {
		version: latest.version,
		urls: () => [url],
	};
});

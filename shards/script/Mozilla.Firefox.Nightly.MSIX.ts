import { defineShard } from 'anthelion';
import ky from 'ky';

const latest = 'https://ftp.mozilla.org/pub/firefox/nightly/latest-mozilla-central';

// Nightly MSIX packages live in a directory named after the build ID, and their package
// version is <major>.<YYMM>.<D><HH>.0 (day without, hour with a leading zero).
export default defineShard(async () => {
	const { FIREFOX_NIGHTLY: appVersion } = await ky(
		'https://product-details.mozilla.org/1.0/firefox_versions.json',
	).json<{ FIREFOX_NIGHTLY: string }>();
	const { buildid } = await ky(`${latest}/firefox-${appVersion}.en-US.win64.json`).json<{ buildid: string }>();
	const [, yyyy, mm, dd, hh, mi, ss] = /^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})$/.exec(buildid)!;
	const major = appVersion.split('.')[0]!;
	const version = `${major}.${yyyy!.slice(2)}${mm}.${Number(dd)}${hh}.0`;
	const dir = `https://ftp.mozilla.org/pub/firefox/nightly/${yyyy}/${mm}/${yyyy}-${mm}-${dd}-${hh}-${mi}-${ss}-mozilla-central`;

	return {
		version,
		urls: () =>
			['win32', 'win64', 'win64-aarch64'].map(
				(platform) => `${dir}/firefox-${appVersion}.multi.${platform}.installer.msix`,
			),
		releaseNotes: {
			releaseNotesUrl: `https://www.firefox.com/en-US/firefox/${appVersion}/releasenotes/`,
		},
	};
});

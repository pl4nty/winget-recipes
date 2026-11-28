import { defineShard } from 'anthelion';
import { compareVersions } from 'anthelion/helpers';
import ky from 'ky';

// JDK 21 updates after 21.0.12 moved to the OTN license (sign-in required), so the free builds are
// the ones on the JDK 21 archive page. The package version is the Oracle version padded to four
// parts (21.0.12 -> 21.0.12.0, 21.0.12.1 stays as is), matching the existing manifests.
export default defineShard(async () => {
	const page = await ky('https://www.oracle.com/java/technologies/javase/jdk21-archive-downloads.html', {
		timeout: 60_000,
	}).text();
	const versions = [
		...page.matchAll(
			/download\.oracle\.com\/java\/21\/archive\/jdk-(21\.\d+\.\d+(?:\.\d+)?)_windows-x64_bin\.msi/g,
		),
	].map((m) => m[1]!);
	const latest = versions.sort(compareVersions).at(-1);
	if (!latest) {
		throw new Error('No JDK 21 Windows x64 MSI found on the archive page');
	}
	const parts = latest.split('.');
	const version = [...parts, ...Array(Math.max(0, 4 - parts.length)).fill('0')].join('.');

	return {
		version,
		urls: () => [
			`https://download.oracle.com/java/21/archive/jdk-${latest}_windows-x64_bin.msi`,
			`https://download.oracle.com/java/21/archive/jdk-${latest}_windows-x64_bin.exe`,
		],
	};
});

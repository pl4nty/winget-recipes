import { defineShard } from 'anthelion';
import { compareVersions } from 'anthelion/helpers';
import ky from 'ky';

// JDK 20 is end of life; its builds live on the JDK 20 archive page. The package version is the
// Oracle version padded to four parts (20.0.2 -> 20.0.2.0), matching the existing manifests.
export default defineShard(async () => {
	const page = await ky('https://www.oracle.com/java/technologies/javase/jdk20-archive-downloads.html', {
		timeout: 60_000,
	}).text();
	const versions = [
		...page.matchAll(/download\.oracle\.com\/java\/20\/archive\/jdk-(20(?:\.\d+)*)_windows-x64_bin\.msi/g),
	].map((m) => m[1]!);
	const latest = versions.sort(compareVersions).at(-1);
	if (!latest) {
		throw new Error('No JDK 20 Windows x64 MSI found on the archive page');
	}
	const parts = latest.split('.');
	const version = [...parts, ...Array(Math.max(0, 4 - parts.length)).fill('0')].join('.');

	return {
		version,
		urls: () => [
			`https://download.oracle.com/java/20/archive/jdk-${latest}_windows-x64_bin.msi`,
			`https://download.oracle.com/java/20/archive/jdk-${latest}_windows-x64_bin.exe`,
		],
	};
});

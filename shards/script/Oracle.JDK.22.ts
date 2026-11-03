import { defineShard } from 'anthelion';
import { compareVersions } from 'anthelion/helpers';

// JDK 22 is end of life, so the archive page lists every release. Files are
// named jdk-22, jdk-22.0.2, ... while the package uses four parts (22.0.2.0).
export default defineShard(async () => {
	const page = await fetch('https://www.oracle.com/java/technologies/javase/jdk22-archive-downloads.html').then(
		(response) => response.text(),
	);
	const [latest] = [...page.matchAll(/\/java\/22\/archive\/jdk-(22(?:\.\d+)*)_windows-x64_bin\.msi/g)]
		.map((match) => match[1]!)
		.sort((a, b) => compareVersions(b, a));
	if (!latest) throw new Error('No JDK 22 Windows MSI found on the archive page');

	const parts = latest.split('.');
	while (parts.length < 4) parts.push('0');

	return {
		version: parts.join('.'),
		urls: () => [
			`https://download.oracle.com/java/22/archive/jdk-${latest}_windows-x64_bin.msi`,
			`https://download.oracle.com/java/22/archive/jdk-${latest}_windows-x64_bin.exe`,
		],
	};
});

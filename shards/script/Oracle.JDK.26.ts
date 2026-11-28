import { defineShard } from 'anthelion';

export default defineShard(async () => {
	const page = await fetch('https://www.oracle.com/java/technologies/javase/jdk26-archive-downloads.html').then(
		(response) => response.text(),
	);
	const versions = [
		...page.matchAll(/https:\/\/download\.oracle\.com\/java\/26\/archive\/jdk-(26(?:\.\d+)*)_windows-x64_bin\.msi/g),
	].map((match) => match[1]);
	if (versions.length === 0) throw new Error('no JDK 26 Windows msi found');
	const pad = (raw: string) => [...raw.split('.'), '0', '0', '0'].slice(0, 4).join('.');
	const compare = (a: string, b: string) => {
		const [x, y] = [pad(a).split('.').map(Number), pad(b).split('.').map(Number)];
		for (let i = 0; i < 4; i++) if (x[i] !== y[i]) return x[i] - y[i];
		return 0;
	};
	const raw = versions.sort(compare).at(-1)!;

	return {
		version: pad(raw),
		urls: () => [
			`https://download.oracle.com/java/26/archive/jdk-${raw}_windows-x64_bin.msi`,
			`https://download.oracle.com/java/26/archive/jdk-${raw}_windows-x64_bin.exe`,
		],
		releaseNotes: {
			releaseNotesUrl: 'https://www.oracle.com/java/technologies/javase/26-relnote-issues.html',
		},
	};
});

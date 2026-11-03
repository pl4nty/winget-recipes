import { defineShard } from 'anthelion';

const major = '37';

export default defineShard(async () => {
	const releases: { version: string }[] = await fetch('https://releases.electronjs.org/releases.json').then((response) =>
		response.json(),
	);
	const release = releases.find(({ version }) => version.startsWith(`${major}.`) && !version.includes('-'));
	if (!release) throw new Error(`No stable Electron ${major}.x release found`);
	const { version } = release;
	const base = `https://github.com/electron/electron/releases/download/v${version}`;

	return {
		version,
		urls: () => [
			`${base}/electron-v${version}-win32-ia32.zip`,
			`${base}/electron-v${version}-win32-x64.zip`,
			`${base}/electron-v${version}-win32-arm64.zip`,
		],
		releaseNotes: {
			source: 'github',
			owner: 'electron',
			repo: 'electron',
			tag: `v${version}`,
		},
	};
});

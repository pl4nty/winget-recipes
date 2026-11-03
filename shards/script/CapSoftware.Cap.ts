import { defineShard } from 'anthelion';

// Cap's CrabNebula updater feed names the current Windows NSIS installer. The stub is an
// x86 PE, so the architecture is set to match the x64-only app.
export default defineShard(async () => {
	const { version, url } = (await fetch('https://cdn.crabnebula.app/update/cap/cap/windows-x86_64/0.0.0').then(
		(response) => response.json(),
	)) as { version: string; url: string };

	return {
		version,
		urls: () => [{ url: url.split('?')[0]!, architecture: 'x64' }],
		releaseNotes: { source: 'github', owner: 'CapSoftware', repo: 'Cap', tag: `cap-v${version}` },
	};
});

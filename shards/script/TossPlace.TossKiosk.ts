import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';

// The electron-builder feed lists a combined download.exe (the URL upstream
// uses) plus per-architecture installers. Architectures are set explicitly
// because download.exe carries both.
const base = 'https://electron.tossplace.com/toss-kiosk';

export default defineShard(async () => {
	const feed = await fetch(`${base}/latest.yml`).then((response) => response.text());
	const {
		captures: { version },
	} = match(feed, /^version:\s*(?<version>\S+)\s*$/m);

	return {
		version,
		urls: () => [
			{ url: `${base}/windows/download.exe`, architecture: 'x64' },
			{ url: `${base}/windows/download_ia32.exe`, architecture: 'x86' },
		],
	};
});

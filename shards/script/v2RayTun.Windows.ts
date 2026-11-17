import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';

const latest = 'https://storage.v2raytun.com/v2RayTun_Setup.exe';

// The site only links an unversioned setup, and its ProductVersion has four parts
// (3.10.15.0) while winget-pkgs uses three (3.10.15), so read the version resource
// and keep the first three parts. The Inno Setup stub is 32-bit, but the app is x64 like upstream. The versioned copy under /releases/ is the stable URL.
export default defineShard(async () => {
	const response = await fetch(latest);
	if (!response.ok) throw new Error(`${latest} returned ${response.status}`);
	const bytes = new TextDecoder('latin1').decode(await response.arrayBuffer());
	const {
		groups: [raw],
	} = match(bytes, /P\0r\0o\0d\0u\0c\0t\0V\0e\0r\0s\0i\0o\0n\0(?:\0\0)*((?:\d\0|\.\0)+)/, 'No ProductVersion found in the setup');
	const {
		captures: { version },
	} = match(raw.replaceAll('\0', ''), /^(?<version>\d+\.\d+\.\d+)/);

	return {
		version,
		urls: () => [{ url: `https://storage.v2raytun.com/releases/v2RayTun_Setup_${version}.exe`, architecture: 'x64' }],
	};
});

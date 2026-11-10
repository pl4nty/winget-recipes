import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';

// Upstream keeps the leading "v" in PackageVersion (v6), which JSON shards always strip, and the tag
// carries a language suffix (v6-Chinese-v2), so read the version from the zh-CN setup's name.
export default defineShard(async () => {
	const response = await fetch('https://github.com/DuckDuckStudio/osukps/releases/latest', {
		method: 'HEAD',
		redirect: 'manual',
	});
	const location = response.headers.get('location') ?? '';
	const {
		captures: { tag, version },
	} = match(location, /\/releases\/tag\/(?<tag>(?<version>v\d+(?:\.\d+)*)(?:-[^/]+)?)$/, 'No osukps release found');
	const url = `https://github.com/DuckDuckStudio/osukps/releases/download/${tag}/osukps_setup_zh-CN_${version}.exe`;

	return {
		version: version!,
		// Upstream lists the same installer for every architecture.
		urls: () => (['x64', 'x86', 'arm', 'arm64'] as const).map((architecture) => ({ url, architecture })),
	};
});

import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';

// Upstream keeps the leading "v" in PackageVersion (v6), which JSON shards
// always strip. Tags look like v6-Chinese-v2; the version is the leading vN part.
export default defineShard(async () => {
	const response = await fetch('https://github.com/DuckDuckStudio/osukps/releases/latest', { method: 'HEAD', redirect: 'manual' });
	const location = response.headers.get('location') ?? '';
	const {
		captures: { tag, version },
	} = match(location, /\/releases\/tag\/(?<tag>(?<version>v\d+(?:\.\d+)*)(?:-[^/]+)?)$/, 'No stable osukps release found');

	return {
		version,
		urls: () => [`https://github.com/DuckDuckStudio/osukps/releases/download/${tag}/osukps_setup_zh-CN_${version}.exe`],
	};
});

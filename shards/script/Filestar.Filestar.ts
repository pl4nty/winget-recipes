import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';

// The site's download endpoint serves the latest build directly (no redirect) and names it in Content-Disposition.
export default defineShard(async () => {
	const response = await fetch('https://download.filestar.com/latest2/win-x64/winget', { method: 'HEAD' });
	const {
		captures: { version },
	} = match(
		response.headers.get('content-disposition') ?? '',
		/filename="?Filestar\.(?<version>\d+(?:\.\d+)+)\.win-x64/,
		'No Filestar version in the download response',
	);
	const url = (arch: string) => `https://release.filestar.com/releases/${version}/Filestar.${version}.win-${arch}.exe`;

	return {
		version,
		// Upstream lists each architecture's installer twice, once per scope.
		urls: () => [url('x64'), url('x64'), url('x86'), url('x86')],
	};
});

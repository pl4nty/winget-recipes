import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';

// Tags look like v1.0-v1.19 or v1.0-v1.18-r3 (gettext + iconv versions, optional
// rebuild), while upstream PackageVersion is 1.0+1.19 / 1.0+1.18+r3, which a JSON
// version template can't build, so map the latest release tag here.
export default defineShard(async () => {
	const response = await fetch('https://github.com/mlocati/gettext-iconv-windows/releases/latest', {
		method: 'HEAD',
		redirect: 'manual',
	});
	const location = response.headers.get('location') ?? '';
	const {
		captures: { tag, gettext, iconv, rebuild },
	} = match(
		location,
		/\/releases\/tag\/(?<tag>v(?<gettext>\d+(?:\.\d+)+)-v(?<iconv>\d+(?:\.\d+)+)(?:-(?<rebuild>r\d+))?)$/,
		'No stable gettext-iconv-windows release found',
	);
	const base = `https://github.com/mlocati/gettext-iconv-windows/releases/download/${tag}`;

	return {
		version: rebuild ? `${gettext}+${iconv}+${rebuild}` : `${gettext}+${iconv}`,
		urls: () => [
			`${base}/gettext${gettext}-iconv${iconv}-shared-32.exe`,
			`${base}/gettext${gettext}-iconv${iconv}-shared-64.exe`,
		],
		releaseNotes: { source: 'github', owner: 'mlocati', repo: 'gettext-iconv-windows', tag, cleanup: false },
	};
});

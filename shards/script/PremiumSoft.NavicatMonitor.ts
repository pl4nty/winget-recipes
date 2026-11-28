import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';

// The download page asks a form-encoded endpoint for the versioned installer link.
export default defineShard(async () => {
	const response = await fetch('https://www.navicat.com/includes/Navicat/direct_download4.php', {
		method: 'POST',
		body: new URLSearchParams({ product: 'navicatmonitor_en_x64.exe', location: '11', support: '', linux_dist: '', verNum: 'false' }),
	});
	const data = (await response.json()) as { download_link: string };
	const {
		captures: { version },
	} = match(
		data.download_link,
		/^https:\/\/download3\.navicat\.com\/monitor\d+-download\/windows\/navicatmonitor(?<version>\d+(?:\.\d+)+)\.exe$/,
		'No Navicat Monitor installer link found',
	);

	return {
		version,
		urls: () => [{ url: data.download_link, architecture: 'x64' as const }],
	};
});

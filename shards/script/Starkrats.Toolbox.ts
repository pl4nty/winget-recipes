import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';

export default defineShard(async () => {
	const lead = await fetch('https://starkrats.de/x86_64_avx-linux/toolbox.x86_64_avx.rpm', {
		headers: { Range: 'bytes=0-95' },
	}).then((response) => response.text());
	const {
		groups: [base, release],
	} = match(lead, /toolbox-(\d+(?:\.\d+)+)-(\d+)/, 'No toolbox version in the RPM lead');

	return {
		version: `${base}.${release}`,
		urls: () => ['https://starkrats.de/x86_64_avx-win64/toolbox-installer.exe', 'https://starkrats.de/i386-win32/toolbox-installer.exe'],
		replace: true,
	};
});

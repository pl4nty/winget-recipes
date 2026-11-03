import { defineShard } from 'anthelion';
import { compareVersions } from 'anthelion/helpers';

// The download page lists the stable and beta builds (upstream tracks both),
// e.g. setup/v2026_3_0_2/manictime-setup-2026.3.0.2-win-x64.msi. The package
// version drops the century from the year: 2026.3.0.2 -> 26.3.0.2.
const page = 'https://www.manictime.com/download/windows';

export default defineShard(async () => {
	const html = await fetch(page).then((response) => response.text());
	const builds = [...html.matchAll(/cdn\.manictime\.com\/setup\/v\d+(?:_\d+)+\/manictime-setup-(\d+(?:\.\d+)+)-win-x64\.msi/g)].map(
		(found) => found[1],
	);
	if (builds.length === 0) {
		throw new Error('No ManicTime builds found');
	}
	const build = builds.reduce((a, b) => (compareVersions(a, b) >= 0 ? a : b));
	const [year, ...rest] = build.split('.');
	const version = [String(Number(year) % 100), ...rest].join('.');
	const base = `https://cdn.manictime.com/setup/v${build.replaceAll('.', '_')}`;

	return {
		version,
		urls: () => [
			{ url: `${base}/manictime-setup-${build}-win-x64.msi`, architecture: 'x64' },
			{ url: `${base}/manictime-setup-${build}-win-x86.msi`, architecture: 'x86' },
			{ url: `${base}/manictime-portable-${build}-win-x64.zip`, architecture: 'x64' },
			{ url: `${base}/manictime-portable-${build}-win-x86.zip`, architecture: 'x86' },
			{ url: `${base}/manictime-setup-${build}-win-x64.exe`, architecture: 'x64' },
			{ url: `${base}/manictime-setup-${build}-win-x86.exe`, architecture: 'x86' },
		],
	};
});

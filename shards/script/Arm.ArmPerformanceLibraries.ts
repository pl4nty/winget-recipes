import { defineShard } from 'anthelion';

// developer.arm.com renders its download page client-side and publishes no feed,
// so probe the YY.MM permalinks (newest first) for the latest Windows MSI.
const installerUrl = (version: string) =>
	`https://developer.arm.com/-/cdn-downloads/permalink/Arm-Performance-Libraries/Version_${version}/arm-performance-libraries_${version}_Windows.msi`;

export default defineShard(async () => {
	const year = new Date().getUTCFullYear() % 100;
	const candidates: string[] = [];
	for (let yy = year; yy >= year - 1; yy--) {
		for (let mm = 12; mm >= 1; mm--) {
			candidates.push(`${yy}.${String(mm).padStart(2, '0')}`);
		}
	}

	for (const version of candidates) {
		const response = await fetch(installerUrl(version), { method: 'HEAD' });
		if (response.ok) {
			return {
				version,
				urls: () => [{ url: installerUrl(version), architecture: 'arm64' }],
			};
		}
	}

	throw new Error('No Arm Performance Libraries Windows MSI found');
});

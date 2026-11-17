import { defineShard } from 'anthelion';

// ABB publishes no version feed for RobotStudio; installers live on its CDN as
// RobotStudio_<year>.<n>.zip, so probe the current and previous year for the
// highest release that exists.
const base = 'https://robotstudiocdn-b9d5faapereue4ef.a03.azurefd.net/install';

async function exists(version: string) {
	const response = await fetch(`${base}/RobotStudio_${version}.zip`, { method: 'HEAD' });
	return response.ok;
}

export default defineShard(async () => {
	const year = new Date().getUTCFullYear();
	let latest: string | undefined;
	for (const y of [year - 1, year, year + 1]) {
		for (let n = 1; n <= 12; n++) {
			if (await exists(`${y}.${n}`)) latest = `${y}.${n}`;
			else if (n > 1) break;
		}
	}
	if (!latest) throw new Error('No RobotStudio release found on the ABB CDN');

	return {
		version: latest,
		// The setup.exe bootstrapper and MSI are 32-bit, but the installed RobotStudio.exe (Data1.cab) is PE32+ x86-64.
		urls: () => [
			{ url: `${base}/RobotStudio_${latest}.zip`, architecture: 'x64' as const, nestedInstallerMatches: ['RobotStudio/setup.exe'] },
		],
	};
});

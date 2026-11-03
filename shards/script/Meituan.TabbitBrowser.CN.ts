import { defineShard } from 'anthelion';

// The China build moved from tabbit-ai.com to tabbit.com (the old upgrade API
// now answers 410 and points there). The website asks this upgrade API for the
// newest Windows build. The full installer file name uses the first three
// version parts (1.19.25.0 -> ..._1.19.25.exe).
export default defineShard(async () => {
	const response = await fetch('https://www.tabbit.com/api/v0/upgrade/latest?from=website');
	const { versions } = (await response.json()) as {
		versions: { version: string; sparkle_version: number; platform: string }[];
	};
	const [latest] = versions
		.filter((entry) => entry.platform === 'windows')
		.sort((a, b) => b.sparkle_version - a.sparkle_version);
	if (!latest) throw new Error('No Windows build in the Tabbit upgrade API');
	const version = latest.version;
	const short = version.split('.').slice(0, 3).join('.');

	return {
		version,
		urls: () => [
			`https://releases.tabbit.com/upgrade/windows/stable_x64_cn/Tabbit%20Browser_stable_x64_cn_${short}.exe`,
		],
		releaseNotes: {
			releaseNotesUrl: 'https://www.tabbit.com/docs/zh-CN/whats-new',
		},
	};
});

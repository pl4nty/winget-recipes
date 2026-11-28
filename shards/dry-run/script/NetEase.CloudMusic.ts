import { defineShard } from 'anthelion';
import { latestUpstreamVersion } from '../lib/winget.ts';

type Upgrade = { data: { packageVO?: { appver: string; buildver: string; downloadUrl: string } } };

// The upgrade endpoint only answers clients older than the latest release.
export default defineShard(async () => {
	const current = await latestUpstreamVersion('NetEase.CloudMusic');
	const [x86, x64] = await Promise.all(
		['32', '64'].map(async (bits) => {
			const response = (await fetch('https://interface.music.163.com/api/pc/upgrade/get', {
				method: 'POST',
				headers: { cookie: `osver=Microsoft-Windows-10; appver=${current}`, 'content-type': 'application/x-www-form-urlencoded' },
				body: `action=manual&cpuBitWidth=${bits}&e_r=false`,
			}).then((response) => response.json())) as Upgrade;
			if (!response.data.packageVO) throw new Error(`No update after ${current}`);
			return response.data.packageVO;
		}),
	);
	const version = `${x64!.appver}.${x64!.buildver}`;
	if (version !== `${x86!.appver}.${x86!.buildver}`) throw new Error('Inconsistent versions detected');
	return { version, urls: () => [x86!.downloadUrl, x64!.downloadUrl] };
});

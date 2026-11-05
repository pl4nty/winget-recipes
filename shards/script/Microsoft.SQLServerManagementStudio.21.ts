import { defineShard } from 'anthelion';

export default defineShard(async () => {
	const { info } = await fetch('https://aka.ms/ssms/21/release/channel').then((response) => response.json());
	const { url } = await fetch('https://aka.ms/ssms/21/release/vs_SSMS.exe', { method: 'HEAD' });

	return {
		version: info.productDisplayVersion,
		urls: () => [{ url: url, architecture: 'x64' }],
		releaseNotes: { releaseNotesUrl: `https://aka.ms/SSMSReleaseNotes-21#${info.productDisplayVersion.replaceAll('.', '')}` },
	};
});

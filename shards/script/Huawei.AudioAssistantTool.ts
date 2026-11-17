import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';

// The stable support link redirects to a per-file download whose Content-Disposition names the version.
export default defineShard(async () => {
	const link = await fetch('https://consumer-tkb.huawei.com/weknow/servlet/download/public?contextNo=W00020582', {
		method: 'HEAD',
		redirect: 'manual',
	});
	const url = link.headers.get('location');
	if (!url) throw new Error('No Huawei Audio Assistant Tool download redirect');
	const file = await fetch(url, { method: 'HEAD' });
	const {
		groups: [version],
	} = match(
		file.headers.get('content-disposition') ?? '',
		/AudioAssistantTool_(\d+(?:\.\d+)+)_Setup\.exe/i,
		'No Huawei Audio Assistant Tool version in Content-Disposition',
	);

	return {
		version,
		urls: () => [url],
		releaseNotes: { releaseNotesUrl: 'https://consumer.huawei.com/en/support/' },
	};
});

import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';

// The installer reads its versions from setups.json, which answers 406 to text requests,
// so it is read as JSON and the version comes from the stable setup's file name.
export default defineShard(async () => {
	const response = await fetch('https://consumer.com.br/download/setups.json', { headers: { accept: 'application/json' } });
	if (!response.ok) throw new Error(`setups.json returned ${response.status}`);
	const { Stable } = (await response.json()) as { Stable?: { Url?: string } };
	const {
		captures: { version },
	} = match(
		Stable?.Url,
		/^https:\/\/files\.consumer\.com\.br\/public\/setup\/Setup-Consumer-(?<version>\d+(?:\.\d+)+)\.exe$/,
		'No stable Consumer setup found',
	);

	return {
		version,
		urls: () => [`https://files.consumer.com.br/public/setup/Setup-Consumer-${version}.exe`],
		releaseNotes: { releaseNotesUrl: 'https://ajuda.consumer.com.br/' },
	};
});

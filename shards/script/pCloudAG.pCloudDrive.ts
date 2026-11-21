import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';

// The partner download links redirect to short-lived signed URLs whose file name holds the
// version, so read the version from the redirect and keep the stable partner links as installers.
const installers = ['https://partner.pcloud.com/dl/win64', 'https://partner.pcloud.com/dl/win'];

export default defineShard(async () => {
	const response = await fetch(installers[0]!, { method: 'HEAD', redirect: 'manual' });
	const {
		captures: { version },
	} = match(response.headers.get('location'), /\/pCloud_Windows_(?<version>\d+(?:\.\d+)+)_x64\.exe$/);

	return {
		version: `${version}.0`,
		urls: () => [
			{ url: installers[0]!, architecture: 'x64' },
			{ url: installers[1]!, architecture: 'x86' },
		],
		releaseNotes: { releaseNotesUrl: 'https://www.pcloud.com/release-notes' },
		replace: true,
	};
});

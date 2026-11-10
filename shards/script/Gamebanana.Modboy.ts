import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';

// GameBanana's tool API lists the installers newest first; only the file description carries the version.
type File = { _sFile: string; _sDownloadUrl: string; _sDescription: string };

export default defineShard(async () => {
	const { _aFiles: files }: { _aFiles: File[] } = await fetch('https://gamebanana.com/apiv11/Tool/6321/ProfilePage').then(
		(response) => response.json(),
	);
	const file = files.find((f) => /^modboy_install.*\.exe$/i.test(f._sFile));
	if (!file) throw new Error('No Modboy installer on GameBanana tool 6321');
	const {
		captures: { version },
	} = match(file._sDescription, /\bv(?<version>\d+(?:\.\d+)+)/, `No version in "${file._sDescription}"`);

	return {
		version: version!,
		urls: () => [{ url: file._sDownloadUrl, architecture: 'x64' }],
	};
});

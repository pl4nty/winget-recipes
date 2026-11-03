import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';

// Hunspell publishes no Windows binaries; upstream uses the MSVC build on the
// `tst` release of mlt/hunspell. hunspell.exe has no version resource, so the
// version comes from configure.ac at that tag, and the zip's ETag is the state.
const tag = 'tst';
const zip = `https://github.com/mlt/hunspell/releases/download/${tag}/hunspell-msvc-Release-x64.zip`;

export default defineShard(async () => {
	const configure = await fetch(`https://raw.githubusercontent.com/mlt/hunspell/${tag}/configure.ac`).then((response) => response.text());
	const {
		captures: { version },
	} = match(configure, /AC_INIT\(\[hunspell\],\s*\[(?<version>\d+(?:\.\d+)+)\]/);
	const etag = (await fetch(zip, { method: 'HEAD' })).headers.get('etag') ?? undefined;

	return {
		version,
		urls: () => [{ url: zip, nestedInstallerMatches: ['hunspell.exe'] }],
		state: etag,
		releaseNotes: {
			source: 'plain-text',
			sourceUrl: 'https://raw.githubusercontent.com/hunspell/hunspell/master/NEWS',
			releaseNotesUrl: 'https://github.com/hunspell/hunspell/blob/master/NEWS',
			characterLimit: 5000,
			cleanup: false,
		},
		replace: true,
	};
});

import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';

// Upstream keeps the leading "v" in PackageVersion (v2.0.0), which JSON shards
// always strip, so the installer name is read from the download page as is.
export default defineShard(async () => {
	const page = await fetch('https://www.makemkv.com/download/').then((response) => response.text());
	const {
		captures: { tag },
	} = match(page, /Setup_MakeMKV_(?<tag>v\d+(?:\.\d+)+)\.exe/, 'No MakeMKV installer found');

	return {
		version: tag,
		urls: () => [`https://www.makemkv.com/download/Setup_MakeMKV_${tag}.exe`],
		releaseNotes: { releaseNotesUrl: 'https://www.makemkv.com/download/history.html' },
	};
});

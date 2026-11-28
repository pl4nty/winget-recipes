import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';

// The download page serves the installer directly (HEAD is not allowed), so only its first byte is
// requested; the attachment file name carries the version.
export default defineShard(async () => {
	const response = await fetch('https://www.plitch.com/en/downloadsoftware', {
		// no-store skips Anthelion's shared fetch, which clones responses and would read the whole body
		cache: 'no-store',
		headers: { Range: 'bytes=0-0' },
	});
	await response.body?.cancel();
	if (!response.ok) throw new Error(`PLITCH download returned ${response.status}`);
	const disposition = response.headers.get('content-disposition') ?? '';
	const version = match(disposition, /filename="?PLITCH_Setup_(\d+(?:\.\d+)+)\.exe/i).groups[0];

	return {
		version,
		urls: () => [`https://cdn.plitch.com/auto-updater/PLITCH_Setup_${version}.exe`],
	};
});

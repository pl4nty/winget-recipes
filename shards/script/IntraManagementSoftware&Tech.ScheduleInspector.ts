import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';
import ky from 'ky';

// The installer name carries only major.minor and is reused across builds; the build version comes
// from the installer, so the installer name plus its ETag is the update state.
export default defineShard(async () => {
	const page = await ky('https://www.barbecana.com/schedule-inspector/schedule-inspector-download/', { timeout: 60_000, retry: 3 }).text();
	const {
		groups: [file],
	} = match(page, /href="[^"]*\/_downloads\/(ScheduleInspector\d+\.exe)">Download Schedule Inspector/i, 'No Schedule Inspector installer link found');
	const url = `https://www.barbecana.com/_downloads/${file}`;
	const response = await ky.head(url, { timeout: 60_000, retry: 3 });

	return {
		version: { source: 'product' },
		state: `${file} ${response.headers.get('etag') ?? response.headers.get('last-modified')}`,
		urls: () => [url],
		replace: true,
	};
});

import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';

// The change log names versions as "1.4"; winget uses three parts ("1.4.0").
// The download link redirects to a timestamped, version-stable installer path.
export default defineShard(async () => {
	const changeLog = await fetch('https://www.dextronet.com/mind-collected/change-log').then((response) => response.text());
	const parts = match(changeLog, /Changes in version (\d+(?:\.\d+)+)/).groups[0].split('.');
	while (parts.length < 3) parts.push('0');
	const version = parts.join('.');

	const response = await fetch('https://www.dextronet.com/mindcollected.exe', { method: 'HEAD', redirect: 'manual' });
	const location = response.headers.get('location') ?? '';
	const url = match(location, /^(https:\/\/download\.dextronet\.com\/setup_files\/mind-collected\/[\d-]+\/mindcollected\.exe)$/).groups[0];

	return {
		version,
		urls: () => [url],
		releaseNotes: { releaseNotesUrl: 'https://www.dextronet.com/mind-collected/change-log' },
	};
});

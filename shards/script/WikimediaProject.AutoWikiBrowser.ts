import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';
import ky from 'ky';

// Releases are filed as AutoWikiBrowser<digits>/AutoWikiBrowser<digits>.zip
// (6500 = 6.5.0.0); the Snapshots folder holds nightly builds and is skipped.
// Upstream writes 6.5, so trailing zero parts are trimmed down to two parts.
export default defineShard(async () => {
	const feed = await ky(
		'https://sourceforge.net/projects/autowikibrowser/rss?path=/autowikibrowser',
		{
			timeout: 60_000,
			retry: 3,
		},
	).text();

	const {
		groups: [build],
	} = match(feed, /\/autowikibrowser\/AutoWikiBrowser(\d{4})\/AutoWikiBrowser\1\.zip/);

	const parts = build.split('');
	while (parts.length > 2 && parts.at(-1) === '0') parts.pop();

	return {
		version: parts.join('.'),
		urls: () => [
			`https://downloads.sourceforge.net/project/autowikibrowser/autowikibrowser/AutoWikiBrowser${build}/AutoWikiBrowser${build}.zip`,
		],
	};
});

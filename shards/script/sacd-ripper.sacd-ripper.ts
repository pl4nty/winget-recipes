import { defineShard } from 'anthelion';
import { getLatestRelease } from 'anthelion/github';
import { match } from 'anthelion/helpers';

// Releases are tagged 0.3.9.3, but the package version carries the build number
// from the asset name (sacd_extract-0.3.9.3-107-win64.zip -> 0.3.9.3-107).
export default defineShard(async () => {
	const release = await getLatestRelease({
		owner: 'sacd-ripper',
		repo: 'sacd-ripper',
		useLatestEndpoint: true,
	});

	// A release can carry several builds (e.g. -99 and -107); take the highest build number.
	const pattern = /\/sacd_extract-([^/]+)-(\d+)-win64\.zip$/;
	const [url] = release
		.urls()
		.filter((candidate) => pattern.test(candidate))
		.sort((a, b) => Number(match(b, pattern).groups[1]) - Number(match(a, pattern).groups[1]));
	if (!url) throw new Error('No win64 asset found');
	const {
		groups: [base, build],
	} = match(url, pattern);
	const version = `${base}-${build}`;
	const urls = () => [url];

	return {
		version,
		urls,
	};
});

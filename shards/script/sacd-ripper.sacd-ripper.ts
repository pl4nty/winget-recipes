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

	const urls = () => release.urls().filter((url) => /\/sacd_extract-[^/]+-win64\.zip$/.test(url));
	const version = match(urls()[0], /\/sacd_extract-([^/]+)-win64\.zip$/, 'No win64 asset found').groups[0];

	return {
		version,
		urls,
	};
});

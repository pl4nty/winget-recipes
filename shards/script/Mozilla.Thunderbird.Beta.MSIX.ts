import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';

// Mozilla's beta version (e.g. 160.0b3) is packaged as 160.0.3.
export default defineShard(async () => {
	const { LATEST_THUNDERBIRD_DEVEL_VERSION: beta } = await fetch(
		'https://product-details.mozilla.org/1.0/thunderbird_versions.json',
	).then((response) => response.json());
	const {
		captures: { major, build },
	} = match(beta, /^(?<major>\d+(?:\.\d+)*)b(?<build>\d+)$/);
	const base = `https://archive.mozilla.org/pub/thunderbird/releases/${beta}`;

	return {
		version: `${major}.${build}`,
		urls: () => [
			`${base}/win64/multi/Thunderbird%20Setup%20${beta}.msix`,
			`${base}/win32/multi/Thunderbird%20Setup%20${beta}.msix`,
		],
	};
});

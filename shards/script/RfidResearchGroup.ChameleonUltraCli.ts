import { defineShard } from 'anthelion';
import { getLatestReleaseFromRedirect } from 'anthelion/github';

// Upstream keeps the leading "v" in PackageVersion (v2.1.0), which JSON shards always strip.
export default defineShard(async () => {
	const { rawTag } = await getLatestReleaseFromRedirect({ owner: 'RfidResearchGroup', repo: 'ChameleonUltra' });
	if (!/^v\d+(?:\.\d+)+$/.test(rawTag)) throw new Error(`Unexpected ChameleonUltra tag: ${rawTag}`);

	return {
		version: rawTag,
		urls: () => [`https://github.com/RfidResearchGroup/ChameleonUltra/releases/download/${rawTag}/client-windows.zip`],
	};
});

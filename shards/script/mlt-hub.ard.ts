import { defineShard } from 'anthelion';
import { getLatestRelease } from 'anthelion/github';

// Upstream keeps the leading "v" and the prerelease suffix in PackageVersion
// (v1.0.1-alpha), which JSON shards would strip, so use the raw tag.
export default defineShard(async () => {
	const release = await getLatestRelease({
		owner: 'mlt-hub',
		repo: 'AI-Gen-Reimbursement-Docs-Release',
		kind: 'all',
	});
	const urls = release.urls().filter((url) => /\/ard-setup_[^/]+\.exe$/i.test(url));
	if (urls.length !== 1) throw new Error('Expected exactly one ard-setup exe asset');

	return { version: release.rawTag, urls: () => urls };
});

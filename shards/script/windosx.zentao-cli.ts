import { defineShard } from 'anthelion';
import { getLatestReleaseFromRedirect } from 'anthelion/github';

// The zip's top folder carries the version (zentao-cli-<version>-windows-<arch>),
// so the nested portable path is built per release.
export default defineShard(async () => {
	const { rawTag } = await getLatestReleaseFromRedirect({
		owner: 'windosx',
		repo: 'zentao-cli',
	});
	// Tags look like v1.3.0+21.7; the redirect path may percent-encode the '+'.
	const tag = decodeURIComponent(rawTag);
	const version = tag.replace(/^v/, '');
	const base = `https://github.com/windosx/zentao-cli/releases/download/${tag}`;
	const asset = (arch: string) => ({
		url: `${base}/zentao-cli-${version}-windows-${arch}.zip`,
		nestedInstallerMatches: [`zentao-cli-${version}-windows-${arch}\\zentao.exe`],
	});

	return {
		version,
		urls: () => [asset('arm64'), asset('amd64')],
	};
});

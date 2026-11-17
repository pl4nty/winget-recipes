import { defineShard } from 'anthelion';
import { getReleaseByTag } from 'anthelion/github';

// The vendor reuses one release tag (`PreviewVer`) and adds SSF_PreviewVer_R<n>.zip assets; winget versions are 0.<n>.
export default defineShard(async () => {
	const release = await getReleaseByTag({
		owner: 'shimazzz',
		repo: 'SEGASaturnEmulator-SSF',
		tag: 'PreviewVer',
	});
	const latest = release.assets
		.map((asset) => ({ asset, revision: /^SSF_PreviewVer_R(\d+)\.zip$/.exec(asset.name)?.[1] }))
		.filter((entry): entry is { asset: (typeof release.assets)[number]; revision: string } => entry.revision !== undefined)
		.sort((a, b) => Number(a.revision) - Number(b.revision))
		.at(-1);
	if (!latest) throw new Error('No SSF_PreviewVer_R<n>.zip asset on the PreviewVer release');

	return {
		version: `0.${latest.revision}`,
		// SSF.exe in the zip is PE32+ x86-64; komac reports neutral for the zip.
		urls: () => [{ url: latest.asset.browser_download_url, architecture: 'x64' }],
	};
});

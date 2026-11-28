import { defineShard } from 'anthelion';
import { getLatestRelease } from 'anthelion/github';
import { match } from 'anthelion/helpers';

// Beta releases are tagged vX.Y.Z_beta, and the four-part package version is only in the asset names.
export default defineShard(async () => {
	const release = await getLatestRelease({
		owner: 'CXWorld',
		repo: 'CapFrameX',
		kind: 'prerelease',
	});

	const installer = release.assets.find((asset) =>
		/^CapFrameX_\d+(?:\.\d+)+_Beta_Installer\.zip$/i.test(asset.name),
	);
	const portable = release.assets.find((asset) =>
		/^CapFrameX_\d+(?:\.\d+)+_Beta_Portable\.zip$/i.test(asset.name),
	);
	if (!installer || !portable)
		throw new Error(`Missing beta installer or portable archive in ${release.rawTag}`);
	const version = match(installer.name, /^CapFrameX_(\d+(?:\.\d+)+)_Beta_Installer\.zip$/i)
		.groups[0];

	return {
		version,
		// CapFrameX.exe in the same release's portable archive is x64 (PE32+); the bootstrapper is x86.
		urls: () => [
			{ url: installer.browser_download_url, architecture: 'x64' },
			{ url: portable.browser_download_url, architecture: 'x64' },
		],
	};
});

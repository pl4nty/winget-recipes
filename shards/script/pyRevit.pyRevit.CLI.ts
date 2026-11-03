import { defineShard } from 'anthelion';
import { getLatestRelease } from 'anthelion/github';
import { match } from 'anthelion/helpers';

// Release tags carry a build suffix (v7.0.0.26278+2233) that the package
// version drops, so the installer URLs are built from the raw tag. The release
// ships the admin (machine) Inno setup that upstream lists, plus a per-user
// Inno setup and an admin MSI built from release/pyrevit-cli*.iss and .wixproj.
export default defineShard(async () => {
	const release = await getLatestRelease({
		owner: 'pyrevitlabs',
		repo: 'pyRevit',
	});

	const version = match(release.rawTag, /^v?(\d+(?:\.\d+)+)\+\d+$/).groups[0];
	const base = `https://github.com/pyrevitlabs/pyRevit/releases/download/${release.rawTag}`;

	return {
		version,
		urls: () => [
			`${base}/pyRevit_CLI_${version}_admin_signed.exe`,
			`${base}/pyRevit_CLI_${version}_signed.exe`,
			`${base}/pyRevit_CLI_${version}_admin_signed.msi`,
		],
		releaseNotes: {
			source: 'github',
			owner: 'pyrevitlabs',
			repo: 'pyRevit',
			tag: release.rawTag,
		},
	};
});

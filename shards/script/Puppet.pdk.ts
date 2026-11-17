import { defineShard } from 'anthelion';
import { compareVersions } from 'anthelion/helpers';

// PDK MSIs carry a fourth build segment (pdk-3.4.0.1-x64.msi) that the package
// version leaves out, so pick the newest MSI from the directory listing.
export default defineShard(async () => {
	const listing = await fetch('https://downloads.puppet.com/windows/puppet-tools/').then((response) =>
		response.text(),
	);
	const builds = [...new Set([...listing.matchAll(/pdk-(\d+\.\d+\.\d+\.\d+)-x64\.msi/g)].map((m) => m[1]!))];
	const build = builds.sort(compareVersions).at(-1);
	if (!build) throw new Error('No PDK MSI found in the Puppet downloads listing');
	const version = build.split('.').slice(0, 3).join('.');

	return {
		version,
		urls: () => [`https://downloads.puppet.com/windows/puppet-tools/pdk-${build}-x64.msi`],
		releaseNotes: { releaseNotesUrl: `https://github.com/puppetlabs/pdk/releases/tag/v${version}` },
	};
});

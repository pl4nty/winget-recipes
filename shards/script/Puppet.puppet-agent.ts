import { defineShard } from 'anthelion';
import { compareVersions } from 'anthelion/helpers';

// Each agent series has its own windows/puppet<major>/ folder, so find the newest folder before listing its installers.
export default defineShard(async () => {
	let major = 8;
	while ((await fetch(`https://downloads.puppetlabs.com/windows/puppet${major + 1}/`, { method: 'HEAD' })).ok) major++;
	const folder = `https://downloads.puppetlabs.com/windows/puppet${major}/`;
	const page = await fetch(folder).then((response) => response.text());
	const versions = [...page.matchAll(/href="puppet-agent-(\d+(?:\.\d+)+)-x64\.msi"/gi)].map(([, version]) => version!);
	const version = versions.sort(compareVersions).at(-1);
	if (!version) throw new Error(`No puppet-agent MSI found in ${folder}`);

	return {
		version,
		urls: () => [`${folder}puppet-agent-${version}-x86.msi`, `${folder}puppet-agent-${version}-x64.msi`],
	};
});

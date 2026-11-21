import { defineShard } from 'anthelion';
import { compareVersions, match } from 'anthelion/helpers';

// The vendor download portal embeds its release list as a JSON array and the
// URL base path in a script variable. Installer URLs carry the full build
// number (26.4.0.24320), while upstream versions use the first three parts.
export default defineShard(async () => {
	const html = await fetch('https://my.mailstore.com/Downloads').then((response) => response.text());
	const {
		captures: { list },
	} = match(html, /obj = (?<list>\[[\s\S]*?\]);/);
	const {
		captures: { base },
	} = match(html, /urlBasePathPart = '(?<base>\/[^']+\/)'/);
	const builds = (JSON.parse(list) as { version: string; product: string; type: string }[])
		.filter((entry) => entry.product === 'Client' && entry.type === 'msi')
		.map((entry) => entry.version)
		.sort(compareVersions);
	const build = builds.at(-1);
	if (!build) throw new Error('No MailStore Client MSI found');

	return {
		version: build.split('.').slice(0, 3).join('.'),
		urls: () => [`https://download.mailstore.com${base}${build}/MailStoreClientSetup-${build}.msi`],
	};
});

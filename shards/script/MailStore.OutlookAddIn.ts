import { defineShard } from 'anthelion';
import { compareVersions, match } from 'anthelion/helpers';

// The vendor's download portal embeds every build as JSON next to the base path
// its script builds download URLs from. Upstream versions drop the build number
// (26.4.0 for 26.4.0.24320).
export default defineShard(async () => {
	const page = await fetch('https://my.mailstore.com/Downloads?lang=en').then((response) => response.text());
	const {
		captures: { builds, domain, base },
	} = match(
		page,
		/obj = (?<builds>\[[\s\S]*?\]);\s*downloadDomain = '(?<domain>[^']+)';\s*urlBasePathPart = '(?<base>[^']+)'/,
	);
	const build = (JSON.parse(builds) as { version: string; product: string; type: string }[])
		.filter((entry) => entry.product === 'OutlookAddin' && entry.type === 'msi')
		.map((entry) => entry.version)
		.sort(compareVersions)
		.at(-1)!;

	return {
		version: build.split('.').slice(0, 3).join('.'),
		urls: () => [`https://${domain}${base}${build}/MailStoreOutlookAddinSetup-${build}.msi`],
	};
});

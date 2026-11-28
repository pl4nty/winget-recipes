import { defineShard } from 'anthelion';
import { compareVersions } from 'anthelion/helpers';

const base = 'https://cdn.zabbix.com/zabbix/binaries/stable/';

async function latest(url: string, regex: RegExp) {
	const page = await fetch(url).then((response) => response.text());
	const versions = [...page.matchAll(regex)].map((match) => match[1]!);
	if (versions.length === 0) throw new Error(`No versions found at ${url}`);
	return versions.sort(compareVersions).at(-1)!;
}

// The CDN lists release series (7.4/) and then versions inside each series (7.4.8/).
export default defineShard(async () => {
	const series = await latest(base, /href="(\d+\.\d+)\/"/g);
	const version = await latest(`${base}${series}/`, /href="(\d+\.\d+\.\d+)\/"/g);
	const dir = `${base}${series}/${version}`;

	return {
		version,
		urls: () => [
			`${dir}/zabbix_agent2-${version}-windows-amd64-openssl.msi`,
			`${dir}/zabbix_agent2-${version}-windows-i386-openssl.msi`,
		],
		releaseNotes: {
			releaseNotesUrl: `https://www.zabbix.com/rn/rn${version}`,
		},
	};
});

import { defineShard } from 'anthelion';
import { compareVersions } from 'anthelion/helpers';

// The CDS repository nests each release as <major.minor.patch>/<build>/, so read both listings.
const base = 'https://softwareupdate.omnissa.com/horizoncloud-v2-agents/packages/DEM-Agent';

const latest = async (url: string, regex: RegExp) => {
	const listing = await fetch(url).then((response) => response.text());
	const entries = [...listing.matchAll(regex)].map((m) => m[1]!);
	const entry = entries.sort(compareVersions).at(-1);
	if (!entry) throw new Error(`No entries found at ${url}`);
	return entry;
};

export default defineShard(async () => {
	const release = await latest(`${base}/`, /href="(\d+\.\d+\.\d+)\/"/gi);
	const build = await latest(`${base}/${release}/`, /href="(\d+)\/"/gi);
	const version = `${release}.${build}`;

	return {
		version,
		urls: () => [`${base}/${release}/${build}/Omnissa-Dynamic-Environment-Manager-Enterprise-${version}-x64.msi`],
		releaseNotes: {
			releaseNotesUrl: 'https://docs.omnissa.com/category/DEM',
		},
	};
});

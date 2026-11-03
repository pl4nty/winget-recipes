import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';

const base = 'https://archive.mozilla.org/pub/pinebuild/nightly/';

async function latest(path: string, regex: RegExp) {
	const page = await fetch(`${base}${path}`).then((response) => response.text());
	const entries = [...page.matchAll(regex)].map((entry) => entry[1]!).sort();
	if (entries.length === 0) throw new Error(`No entries found in ${base}${path}`);
	return entries.at(-1)!;
}

export default defineShard(async () => {
	const year = await latest('', /href="\/pub\/pinebuild\/nightly\/(\d{4})\/"/g);
	const month = await latest(`${year}/`, /href="\/pub\/pinebuild\/nightly\/\d{4}\/(\d{2})\/"/g);
	const build = await latest(
		`${year}/${month}/`,
		/href="\/pub\/pinebuild\/nightly\/\d{4}\/\d{2}\/([\d-]+-pine)\/"/g,
	);
	const listing = await fetch(`${base}${year}/${month}/${build}/`).then((response) =>
		response.text(),
	);
	const {
		groups: [version],
	} = match(listing, /pinebuild-([\d.]+a\d+)\.en-US\.win64\.installer\.msi"/);
	const dir = `${base}${year}/${month}/${build}`;

	return {
		version: version!,
		urls: () => [
			`${dir}/pinebuild-${version}.en-US.win64.installer.msi`,
			`${dir}/pinebuild-${version}.en-US.win64.installer.exe`,
			`${dir}/pinebuild-${version}.en-US.win64-aarch64.installer.exe`,
		],
	};
});

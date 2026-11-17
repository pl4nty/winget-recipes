import { defineShard } from 'anthelion';
import { compareVersions } from 'anthelion/helpers';

// Windows builds sit in a folder per major version (41/gitg-x86_64-41.0.msi), so find the newest folder, then the newest MSI in it.
const BASE = 'https://download.gnome.org/binaries/win64/gitg';
const newest = (page: string, regex: RegExp) => {
	const found = [...page.matchAll(regex)].map((m) => m[1]!).sort(compareVersions);
	if (!found.length) throw new Error(`No match for ${regex}`);
	return found.at(-1)!;
};

export default defineShard(async () => {
	const folder = newest(await fetch(`${BASE}/`).then((response) => response.text()), /href="(\d+(?:\.\d+)*)\/"/g);
	const page = await fetch(`${BASE}/${folder}/`).then((response) => response.text());
	const version = newest(page, /gitg-x86_64-(\d+(?:\.\d+)+)\.msi/g);

	return {
		version,
		urls: () => [`${BASE}/${folder}/gitg-x86_64-${version}.msi`],
		releaseNotes: { releaseNotesUrl: 'https://gitlab.gnome.org/GNOME/gitg/-/blob/master/NEWS' },
	};
});

import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';

// Parallels publishes the RAS download links as JSON for its download page:
// index.json lists one entry per major version, each with a builds file.
const base = 'https://download.parallels.com/website_links/ras';

type Builds = { category: { name: string }; contents: { name: string; subcategory?: string; files?: Record<string, string>; changelog?: string }[] }[];

export default defineShard(async () => {
	const index: Record<string, { builds: Record<string, string> }> = await fetch(`${base}/index.json`).then((response) => response.json());
	const major = Object.keys(index).sort((a, b) => Number(b) - Number(a))[0];
	const builds: Builds = await fetch(`${base}/${major}/builds-en_US.json`).then((response) => response.json());
	const msi = builds
		.flatMap((category) => category.contents)
		.find((entry) => entry.name === 'MSI installers' && entry.subcategory === 'Windows');
	if (!msi?.files) throw new Error('No Windows MSI installers in Parallels RAS builds');
	const files = Object.values(msi.files);
	const pick = (pattern: RegExp) => {
		const url = files.find((file) => pattern.test(file));
		if (!url) throw new Error(`No Parallels Client MSI matching ${pattern}`);
		return url;
	};
	const x86 = pick(/\/RASClient-\d[\d.]*\.msi$/);
	const {
		captures: { version },
	} = match(x86, /\/RASClient-(?<version>\d+(?:\.\d+)+)\.msi$/);

	const changelog = msi.changelog;
	if (!changelog) throw new Error('No changelog for Parallels Client MSI installers');
	const html = await fetch(changelog).then((response) => response.text());
	const {
		groups: [title],
	} = match(html, /<h1[^>]*id="article-title"[^>]*>\s*([^<]+?)\s*</);

	return {
		version,
		urls: () => [pick(/\/RASClient-\d[\d.]*\.msi$/), pick(/\/RASClient-x64-[\d.]+\.msi$/), pick(/\/RASClient-ARM64-[\d.]+\.msi$/)],
		releaseNotes: {
			source: 'html',
			sourceUrl: `data:text/html,${encodeURIComponent(`<p>${title}</p>`)}`,
			releaseNotesUrl: changelog,
			cleanup: false,
		},
	};
});

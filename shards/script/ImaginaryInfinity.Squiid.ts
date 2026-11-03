import { defineShard } from 'anthelion';

type Release = { tag_name: string; assets: { links: { name: string; url: string }[] } };

// Installer links point at CI job artifacts, so take the URL from the latest GitLab release.
export default defineShard(async () => {
	const [release] = (await fetch(
		'https://gitlab.com/api/v4/projects/ImaginaryInfinity%2Fsquiid-calculator%2Fsquiid/releases?per_page=1',
	).then((response) => response.json())) as Release[];
	const installer = release!.assets.links.find((link) => /\/squiid-installer\.exe$/.test(link.url));
	if (!installer) throw new Error(`No Windows installer in release ${release!.tag_name}`);

	return {
		version: release!.tag_name.replace(/^v/, ''),
		urls: () => [installer.url],
		releaseNotes: {
			releaseNotesUrl: `https://gitlab.com/ImaginaryInfinity/squiid-calculator/squiid/-/releases/${release!.tag_name}`,
		},
	};
});

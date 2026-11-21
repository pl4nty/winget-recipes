import { defineShard } from 'anthelion';

type Release = { tag_name: string; assets: { links: { name: string; url: string }[] } };

// The Windows installer is a GitLab release link whose position among the release assets varies.
export default defineShard(async () => {
	const release: Release = await fetch(
		'https://gitlab.com/api/v4/projects/dev-nis%2Fnis-one-click-backup-qt/releases/permalink/latest',
	).then((response) => response.json());
	const installer = release.assets.links.find((link) => /\.exe$/i.test(link.url));
	if (!installer) throw new Error(`No Windows installer in release ${release.tag_name}`);

	return {
		version: release.tag_name,
		urls: () => [installer.url],
		releaseNotes: {
			releaseNotesUrl: `https://gitlab.com/dev-nis/nis-one-click-backup-qt/-/releases/${release.tag_name}`,
		},
	};
});

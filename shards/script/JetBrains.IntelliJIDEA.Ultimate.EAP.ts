import { defineShard } from 'anthelion';

type Release = {
	build: string;
	notesLink?: string;
	downloads: Record<string, { link: string }>;
};

// The releases API names each EAP build and links its YouTrack release notes article.
export default defineShard(async () => {
	const { IIU } = (await fetch('https://data.services.jetbrains.com/products/releases?code=IIU&type=eap&latest=true').then(
		(response) => response.json(),
	)) as { IIU: Release[] };
	const release = IIU[0];
	if (!release) throw new Error('No IntelliJ IDEA EAP release found');

	return {
		version: release.build,
		urls: () => [release.downloads.windows!.link, release.downloads.windowsARM64!.link],
		...(release.notesLink && { releaseNotes: { releaseNotesUrl: release.notesLink } }),
	};
});

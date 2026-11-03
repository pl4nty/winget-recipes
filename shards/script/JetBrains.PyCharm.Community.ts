import { defineShard } from 'anthelion';

type Release = {
	version: string;
	notesLink?: string;
	downloads: Record<string, { link: string } | undefined>;
};

export default defineShard(async () => {
	const { PCC: releases }: { PCC: Release[] } = await fetch(
		'https://data.services.jetbrains.com/products/releases?code=PCC&type=release',
	).then((response) => response.json());

	// PyCharm Community was folded into the unified PyCharm in 2025.3; the PCC
	// feed now also lists unified builds, so keep only Community Edition installers.
	const release = releases.find((release) =>
		release.downloads.windows?.link.includes('/pycharm-community-'),
	);
	if (!release?.downloads.windows || !release.downloads.windowsARM64) {
		throw new Error('No PyCharm Community Edition release found');
	}
	const { windows, windowsARM64 } = release.downloads;

	return {
		version: release.version,
		urls: () => [windows.link, windowsARM64.link],
		...(release.notesLink && {
			releaseNotes: { releaseNotesUrl: release.notesLink },
		}),
	};
});

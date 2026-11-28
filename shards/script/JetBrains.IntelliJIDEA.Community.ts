import { defineShard } from 'anthelion';

type Release = {
	version: string;
	notesLink?: string | null;
	whatsnew?: string | null;
	downloads: Record<string, { link: string } | undefined>;
};

// Since 2025.3 the IIC product code also lists the unified IntelliJ IDEA build (idea-<version>.exe),
// so pick the newest release that still ships the Community Edition installer (ideaIC-<version>.exe).
export default defineShard(async () => {
	const { IIC: releases }: { IIC: Release[] } = await fetch(
		'https://data.services.jetbrains.com/products/releases?code=IIC&type=release',
	).then((response) => response.json());

	const release = releases.find((release) => /\/ideaIC-[^/]+\.exe$/.test(release.downloads.windows?.link ?? ''));
	if (!release) throw new Error('No IntelliJ IDEA Community Edition release found');

	const x64 = release.downloads.windows!.link;
	const arm64 = release.downloads.windowsARM64?.link;

	return {
		version: release.version,
		urls: () => [x64, ...(arm64 ? [arm64] : [])],
		releaseNotes: {
			source: 'html',
			sourceUrl: `data:text/html,${encodeURIComponent(release.whatsnew || '<p>For more details, refer to our release notes.</p>')}`,
			releaseNotesUrl: release.notesLink ?? 'https://www.jetbrains.com/idea/whatsnew/',
			cleanup: false,
		},
	};
});

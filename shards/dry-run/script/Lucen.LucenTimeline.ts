import { defineShard } from 'anthelion';

export default defineShard(() => ({
	version: { source: 'display' },
	urls: () => [{ url: 'https://www.lucensoftware.com/website/content/download/install/latest/LucenTimelinePreExtracted.zip', nestedInstallerMatches: ['LucenTimeline.msi'] }],
}));

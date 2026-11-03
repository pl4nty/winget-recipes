import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';

// The Starter edition has no public download link. The public Free edition download redirects to
// DmxTrackWizard64FreeSetup_v<YYMM>.exe, and the Starter installer of the same release sits next to
// it as DmxTrackWizard64StarterSetup_v<YYMM><letter>.exe, so probe for the newest letter suffix.
const base = 'https://www.studiociriello.it/download/TrackwizardNew';

export default defineShard(async () => {
	const response = await fetch('https://www.trackwizard.eu/download/2111/', { method: 'HEAD', redirect: 'manual' });
	const {
		captures: { year, month },
	} = match(response.headers.get('location'), /FreeSetup_v(?<year>\d{2})(?<month>\d{2})\.exe$/i);

	const suffixes = ['', ...'abcdefghijklmnopqrstuvwxyz'];
	let url: string | undefined;
	for (const suffix of suffixes) {
		const candidate = `${base}/DmxTrackWizard64StarterSetup_v${year}${month}${suffix}.exe`;
		const { ok } = await fetch(candidate, { method: 'HEAD' });
		if (ok) url = candidate;
		else if (url) break;
	}
	if (!url) throw new Error(`No Starter installer found for v${year}${month}`);

	return {
		version: `${year}.${month}`,
		urls: () => [url],
	};
});

import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';

// The downloads page is a single-page app, so the installer link is in its versioned script bundle.
export default defineShard(async () => {
	const page = await fetch('https://kgsai.com/downloads').then((response) => response.text());
	const {
		groups: [bundle],
	} = match(page, /src="(\/static\/kgsai[^"]*\.js)"/i, 'No KGSAI script bundle found');
	const script = await fetch(new URL(bundle, 'https://kgsai.com/')).then((response) => response.text());
	const {
		groups: [version],
	} = match(script, /downloads\.kgsai\.com\/CGoban-(\d+(?:\.\d+)+)\.msi/i, 'No CGoban MSI link found');

	return {
		version,
		urls: () => [`https://downloads.kgsai.com/CGoban-${version}.msi`],
		releaseNotes: { releaseNotesUrl: 'https://kgsai.com/downloads' },
	};
});

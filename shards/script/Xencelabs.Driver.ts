import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';

// The download button is a numbered redirect to a dated directory, so the installer URL is the redirect's destination.
export default defineShard(async () => {
	const page = await fetch('https://www.xencelabs.com/support/download-drivers').then((response) => response.text());
	const {
		captures: { version, id, notes },
	} = match(
		page,
		/<h3>Windows<\/h3>\s*<p class="drivers_info">XencelabsWin_(?<version>\d+(?:\.\d+)+-\d+)<\/p>[\s\S]*?href="\/support\/release-notes\/(?<notes>xencelabs-driver-windows-[\d-]+)"[\s\S]*?href="\/support\/file\/id\/(?<id>\d+)\/type\/1"/i,
		'No Xencelabs Windows driver found',
	);
	const response = await fetch(`https://www.xencelabs.com/support/file/id/${id}/type/1`, { method: 'HEAD', redirect: 'manual' });
	const location = response.headers.get('location');
	if (!location) throw new Error(`No installer redirect for Xencelabs driver ${version}`);
	const url = new URL(location, 'https://download01.xencelabs.com').href;
	if (!url.endsWith(`/XencelabsWin_${version}.exe`)) throw new Error(`Unexpected installer URL ${url}`);

	return {
		version,
		urls: () => [url],
		releaseNotes: { releaseNotesUrl: `https://www.xencelabs.com/support/release-notes/${notes}` },
	};
});

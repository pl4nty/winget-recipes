import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';

// Imagination publishes PVRTexTool as PVRTexToolSetup-<year>_R<n>.msi on its CDN. The latest
// SDK release (REL-<yy>.<n>) comes from the release notes; a tool is not always
// re-uploaded for every release, so the newest existing MSI is used and its
// version is read from the MSI.
export default defineShard(async () => {
	const notes = await (await fetch('https://developer.imaginationtech.com/downloads/latest-release-notes/')).text();
	const {
		captures: { year, release },
	} = match(notes, /\/blob\/REL-(?<year>\d{2})\.(?<release>\d)\//, 'No SDK release found in the release notes');

	let y = 2000 + Number(year);
	let r = Number(release);
	for (let attempt = 0; attempt < 4; attempt++) {
		const url = `https://cdn.imgtec.com/sdk/OFFLINE/PVRTexToolSetup-${y}_R${r}.msi`;
		const response = await fetch(url, { method: 'HEAD' });
		if (response.ok) {
			const etag = response.headers.get('etag') ?? response.headers.get('last-modified') ?? '';
			return {
				version: { source: 'display' },
				urls: () => [url],
				state: `${url} ${etag}`,
				releaseNotes: {
					releaseNotesUrl: 'https://developer.imaginationtech.com/downloads/latest-release-notes/#pvrtextool',
				},
				replace: true,
			};
		}
		if (r > 1) r--;
		else {
			y--;
			r = 2;
		}
	}
	throw new Error('No PVRTexTool MSI found for the latest SDK releases');
});

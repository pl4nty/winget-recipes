import { defineShard } from 'anthelion';
import { getLatestFileCommit } from 'anthelion/github';
import { match } from 'anthelion/helpers';

// The MSI lives on the LatestFiles branch. The MSI's own ProductVersion is only 5.0, while WinGet uses
// the application's full version, which the updater manifest beside it records for the same commit.
export default defineShard(async () => {
	const commit = await getLatestFileCommit({ owner: 'EVEIPH', repo: 'LatestFiles', branch: 'master', path: 'EVE Isk per Hour.msi' });
	const xml = await fetch(`https://raw.githubusercontent.com/EVEIPH/LatestFiles/${commit}/LatestVersionIPH.xml`).then((response) =>
		response.text(),
	);
	const {
		groups: [version],
	} = match(xml, /<row Name="EVE Isk per Hour\.exe" Version="(\d+(?:\.\d+)+)"/i, 'No EVE Isk per Hour.exe version in LatestVersionIPH.xml');

	return {
		version,
		urls: () => [`https://raw.githubusercontent.com/EVEIPH/LatestFiles/${commit}/EVE%20Isk%20per%20Hour.msi`],
		releaseNotes: {
			releaseNotesUrl: `https://github.com/EVEIPH/LatestFiles/blob/${commit}/Patch%20Notes.txt`,
		},
	};
});

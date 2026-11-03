import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';

const releaseNotesUrl = 'https://t1.daumcdn.net/potplayer/PotPlayer/v4/Update2/UpdateEng.html';

// The installers live at unversioned "Latest" URLs; the update history names each
// build by its YYMMDD date, which winget-pkgs versions as YY.MM.DD.0.
export default defineShard(async () => {
	const response = await fetch(releaseNotesUrl);
	if (!response.ok) throw new Error(`Failed to fetch PotPlayer update history: ${response.status}`);
	const [year, month, day] = match(await response.text(), /\[(\d{2})(\d{2})(\d{2})\]/).groups;

	return {
		version: `${year}.${month}.${day}.0`,
		urls: () => [
			'https://t1.daumcdn.net/potplayer/PotPlayer/Version/Latest/PotPlayerSetup.exe',
			'https://t1.daumcdn.net/potplayer/PotPlayer/Version/Latest/PotPlayerSetup64.exe',
			'https://t1.daumcdn.net/potplayer/PotPlayer/Version/Latest/PotPlayerSetupARM64.exe',
		],
		releaseNotes: { releaseNotesUrl },
	};
});

import { defineShard } from 'anthelion';

export default defineShard(async () => {
	// KB2683 lists Veeam Agent for Microsoft Windows builds, newest first.
	const page = await fetch('https://www.veeam.com/kb2683').then((response) => response.text());
	const match =
		/<td[^>]*>(?<version>(?<major>\d+)\.\d+\.\d+\.\d+)<\/td>\s*<td[^>]*>\d{4}-\d{2}-\d{2}<\/td>\s*<td[^>]*>\s*<a href="(?<notes>[^"#]+)/.exec(
			page,
		);
	if (!match?.groups) throw new Error('Veeam Agent for Microsoft Windows build not found in KB2683');
	const { version, major, notes } = match.groups;

	return {
		version,
		urls: () => [`https://download2.veeam.com/VAW/v${major}/VeeamAgentWindows_${version}_wg.exe`],
		releaseNotes: {
			releaseNotesUrl: notes,
		},
	};
});

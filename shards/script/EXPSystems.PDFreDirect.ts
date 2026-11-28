import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';

// WinGet keeps the leading v (v2.5.2), which JSON shards strip. The freeware installer is named
// after the version without dots (Install_PDFR_v252.exe) next to the Pro build on the same server.
export default defineShard(async () => {
	const page = await fetch('https://www.exp-systems.com/PDFreDirect/Downloads.htm').then((response) => response.text());
	const {
		groups: [number],
	} = match(page, /<b>PDF reDirect v(\d+\.\d+\.\d+)<\/b>/i, 'No PDF reDirect version found');

	return {
		version: `v${number}`,
		urls: () => [`https://www.exp-systems.com/PDFreDirect/Download/Install_PDFR_v${number.replaceAll('.', '')}.exe`],
		releaseNotes: { releaseNotesUrl: 'https://www.exp-systems.com/PDFreDirect/Downloads.htm' },
	};
});

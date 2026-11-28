import { defineShard } from 'anthelion';

// The installer URL never changes; upstream versions are the date the installer was last modified.
const URL = 'https://mendelson.org/PDFtoPrinter-Installer.exe';

export default defineShard(async () => {
	const response = await fetch(URL, { method: 'HEAD' });
	const modified = response.headers.get('last-modified');
	if (!response.ok || !modified) throw new Error('No last-modified header for the PDFtoPrinter installer');

	return {
		version: new Date(modified).toISOString().slice(0, 10),
		urls: () => [URL],
		releaseNotes: { releaseNotesUrl: 'https://mendelson.org/pdftoprinter.html' },
		replace: true,
	};
});

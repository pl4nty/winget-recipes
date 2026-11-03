import { defineShard } from 'anthelion';

// git.silica.codes (Gitea) often takes 10-25 s to answer, longer than the json
// strategy's request timeout, so read the latest release with a plain fetch.
// Tags are v1.2 while the package uses the exe's file version (1.2.0.0).
export default defineShard(async () => {
	const { tag_name: tag, body, html_url: releaseNotesUrl } = await fetch('https://git.silica.codes/api/v1/repos/Li/DumpDVD/releases/latest', {
		signal: AbortSignal.timeout(120_000),
	}).then((response) => response.json());

	return {
		version: { source: 'file' },
		urls: () => [`https://git.silica.codes/Li/DumpDVD/releases/download/${tag}/DumpDVD.exe`],
		releaseNotes: body
			? {
					source: 'markdown',
					sourceUrl: `data:text/markdown,${encodeURIComponent(body)}`,
					releaseNotesUrl,
					cleanup: false,
				}
			: { releaseNotesUrl },
	};
});

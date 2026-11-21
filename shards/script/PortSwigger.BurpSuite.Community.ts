import { defineShard } from 'anthelion';

// The unversioned Community download names the current build in its
// Content-Disposition (burpsuite_community_windows-x64_v2026_3_3.exe).
// Release notes are the article section of the vendor release page, passed to
// the html source as a data: URL so the page navigation is left out.
const download = (type: string, version?: string) =>
	`https://portswigger.net/burp/releases/download?product=community${version ? `&version=${version}` : ''}&type=${type}`;

export default defineShard(async () => {
	const response = await fetch(download('WindowsX64'), {
		headers: { range: 'bytes=0-0' },
		signal: AbortSignal.timeout(60_000),
	});
	await response.body?.cancel();
	const disposition = response.headers.get('content-disposition') ?? '';
	const build = /burpsuite_community_windows-x64_v(\d+(?:_\d+)+)\.exe/i.exec(disposition)?.[1];
	if (!build) throw new Error(`Unexpected Content-Disposition: ${disposition}`);
	const version = build.replaceAll('_', '.');

	const releaseNotesUrl = `https://portswigger.net/burp/releases/professional-community-${version.replaceAll('.', '-')}`;
	const page = await fetch(releaseNotesUrl, { signal: AbortSignal.timeout(60_000) }).then((response) => response.text());
	const article = /<!-- Article Start -->([\s\S]*?)<!-- Article End -->/.exec(page)?.[1]?.trim();

	return {
		version,
		urls: () => [
			download('WindowsX64', version),
			download('WindowsX64', version),
			download('WindowsArm64', version),
			download('WindowsArm64', version),
		],
		releaseNotes: article
			? {
					source: 'html',
					sourceUrl: `data:text/html,${encodeURIComponent(article)}`,
					releaseNotesUrl,
					cleanup: false,
				}
			: { releaseNotesUrl },
	};
});

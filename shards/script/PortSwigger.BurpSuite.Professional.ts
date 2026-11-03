import { defineShard } from 'anthelion';

// The unversioned Professional download names the current build in its
// Content-Disposition (burpsuite_pro_windows-x64_v2026_3_3.exe).
// Release notes are the article section of the vendor release page, passed to
// the html source as a data: URL so the page navigation is left out.
const download = (host: string, type: string, version?: string) =>
	`https://${host}/burp/releases/download?product=pro${version ? `&version=${version}` : ''}&type=${type}`;

export default defineShard(async () => {
	const response = await fetch(download('portswigger.net', 'WindowsX64'), {
		headers: { range: 'bytes=0-0' },
		signal: AbortSignal.timeout(60_000),
	});
	await response.body?.cancel();
	const disposition = response.headers.get('content-disposition') ?? '';
	const build = /burpsuite_pro_windows-x64_v(\d+(?:_\d+)+)\.exe/i.exec(disposition)?.[1];
	if (!build) throw new Error(`Unexpected Content-Disposition: ${disposition}`);
	const version = build.replaceAll('_', '.');

	const releaseNotesUrl = `https://portswigger.net/burp/releases/professional-community-${version.replaceAll('.', '-')}`;
	const page = await fetch(releaseNotesUrl, { signal: AbortSignal.timeout(60_000) }).then((response) => response.text());
	const article = /<!-- Article Start -->([\s\S]*?)<!-- Article End -->/.exec(page)?.[1]?.trim();

	// Upstream lists the same x64 installer twice (user and machine scope); arm64 is added the same way.
	// portswigger.net is used because portswigger-cdn.net (upstream's host) answers the URL check with 405
	return {
		version,
		urls: () => [
			download('portswigger.net', 'WindowsX64', version),
			download('portswigger.net', 'WindowsX64', version),
			download('portswigger.net', 'WindowsArm64', version),
			download('portswigger.net', 'WindowsArm64', version),
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

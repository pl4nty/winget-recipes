import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';

// The SDK page links each build through go.microsoft.com, so the installer URL is the redirect's destination.
export default defineShard(async () => {
	const page = await fetch('https://learn.microsoft.com/en-us/windows/apps/windows-sdk/downloads-archive').then((response) => response.text());
	const {
		captures: { version, link },
	} = match(page, /conjunction with Windows 11\. Includes servicing update (?<version>10\.0\.22000\.\d+)[\s\S]*?linkid=(?<link>\d+)/i, 'No Windows SDK 22000 build found');
	const response = await fetch(`https://go.microsoft.com/fwlink/?linkid=${link}`, { method: 'HEAD', redirect: 'manual' });
	const url = response.headers.get('location');
	if (!url) throw new Error(`No installer redirect for Windows SDK ${version}`);

	return {
		version,
		urls: () => [url],
		releaseNotes: { releaseNotesUrl: 'https://learn.microsoft.com/en-us/windows/apps/windows-sdk/downloads-archive' },
	};
});

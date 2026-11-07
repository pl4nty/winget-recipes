import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';

// The release notes link each language through go.microsoft.com, so the installer URLs are the redirects' destinations.
const LANGUAGES = ['0x407', '0x409', '0x40a', '0x40c', '0x410', '0x411', '0x412', '0x416', '0x419', '0x804', '0x404'];

export default defineShard(async () => {
	const page = await fetch('https://learn.microsoft.com/en-us/ssms/release-notes-20').then((response) => response.text());
	const {
		captures: { version, link },
	} = match(page, /Download SSMS (?<version>20\.\d+\.\d+)[\s\S]*?linkid=(?<link>\d+)/i, 'No SSMS 20 release found');
	const urls = await Promise.all(
		LANGUAGES.map(async (language) => {
			const response = await fetch(`https://go.microsoft.com/fwlink/?linkid=${link}&clcid=${language}`, {
				method: 'HEAD',
				redirect: 'manual',
			});
			const url = response.headers.get('location');
			if (!url) throw new Error(`No installer redirect for SSMS ${version} (${language})`);
			return { url, architecture: 'x64' as const };
		}),
	);

	return {
		version,
		urls: () => urls,
		releaseNotes: { releaseNotesUrl: `https://learn.microsoft.com/en-us/ssms/release-notes-20#${version.replaceAll('.', '')}` },
	};
});

import { defineShard } from 'anthelion';
import { pageMatch } from 'anthelion/strategies';

// The download page names only the three-part release (hw_v680.exe for v6.8.0), while the package
// version is the installer's four-part product version, so the release name is the update state.
// Releases are listed newest first.
export default defineShard(async () => {
	const { version: release } = await pageMatch({
		url: 'http://www.bpsoft.com/downloads/',
		regex: /Hex Workshop Hex Editor v(\d+\.\d+\.\d+)/i,
	});

	return {
		version: { source: 'product' },
		state: release,
		urls: () => [`http://www.bpsoft.com/downloads/hw_v${release.replaceAll('.', '')}.exe`],
		releaseNotes: { releaseNotesUrl: 'http://www.hexworkshop.com/version_history.html' },
	};
});

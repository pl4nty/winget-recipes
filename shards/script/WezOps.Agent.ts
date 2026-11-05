import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';

const msi = 'https://wezops.com/api/agents/msi/';

// The MSI is served from an unversioned URL; its Content-Disposition names the version
export default defineShard(async () => {
	const disposition = (await fetch(msi, { method: 'HEAD' })).headers.get('content-disposition') ?? '';
	const {
		groups: [version],
	} = match(disposition, /wezops-agent-(\d+(?:\.\d+)+)\.msi/);

	return {
		version,
		urls: () => [{ url: msi, architecture: 'x64' }],
		releaseNotes: {
			releaseNotesUrl: 'https://wezops.com/changelog',
		},
	};
});

import { defineShard } from 'anthelion';

// The update feed lists releases newest first. Installer paths use the build number, the version's last part.
type Feed = { releases: { product: string; version: string; publication_type: string }[] };

export default defineShard(async () => {
	const { releases }: Feed = await fetch('https://updates.wavevms.com/hanwha/releases.json').then((response) => response.json());
	const release = releases.find(({ product, publication_type }) => product === 'vms' && publication_type === 'release');
	if (!release) throw new Error('No Wisenet WAVE VMS release in the update feed');
	const { version } = release;
	const build = version.split('.').at(-1);

	return {
		version,
		urls: () => [{ url: `https://updates.wavevms.com/hanwha/${build}/windows/wave-server-${version}-windows_x64.exe`, architecture: 'x64' }],
		releaseNotes: { releaseNotesUrl: `https://hanwhavisionamerica.com/wisenet-wave-vms-release-notes/#:~:text=${version}` },
	};
});

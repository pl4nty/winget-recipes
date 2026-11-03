import { defineShard } from 'anthelion';
import { compareVersions } from 'anthelion/helpers';

// The newest 3.14 embeddable zip comes from the Windows downloads page.
export default defineShard(async () => {
	const downloads = await fetch('https://www.python.org/downloads/windows/').then((response) => response.text());
	const versions = [...downloads.matchAll(/\/ftp\/python\/3\.14\.\d+\/python-(3\.14\.\d+)-embed-amd64\.zip"/g)].map(
		([, version]) => version,
	);
	const [version] = versions.sort((a, b) => compareVersions(b, a));
	const base = `https://www.python.org/ftp/python/${version}/python-${version}-embed`;

	return {
		version,
		urls: () => [
			{ url: `${base}-amd64.zip`, architecture: 'x64' },
			{ url: `${base}-win32.zip`, architecture: 'x86' },
			{ url: `${base}-arm64.zip`, architecture: 'arm64' },
		],
	};
});

import { defineShard } from 'anthelion';

// The vendor's download page reads versions.txt, which stores the version as numbers (maj, min, release).
export default defineShard(async () => {
	const versions = (await fetch('https://www.iris-instruments.com/Download/versions.txt').then((response) =>
		response.json(),
	)) as { electreTerraSequencer?: { version?: { maj: number; min: number; release: number } } };
	const parts = versions.electreTerraSequencer?.version;
	if (!parts) throw new Error('No electreTerraSequencer version in versions.txt');
	const version = `${parts.maj}.${parts.min}.${parts.release}`;

	return {
		version,
		urls: () => [
			`https://download.iris-instruments.com/Download/ElectreTerraSequencer/v${version}/SetupElectreTerraSequencer.exe`,
		],
	};
});

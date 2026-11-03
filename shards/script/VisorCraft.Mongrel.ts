import { defineShard } from 'anthelion';

type ReleaseFile = {
	id: string;
	version: string;
	channel: string;
	platform: string;
	arch: string;
	file_name: string;
};

// The vendor download API lists every release file with an id; the download
// URL is /api/downloads/mongrel/<id>. Upstream lists, per architecture, the
// MSI first and then the NSIS setup.
export default defineShard(async () => {
	const api = 'https://www.visorcraft.com/api/downloads/mongrel';
	const { files } = (await fetch(api).then((response) => response.json())) as { files: ReleaseFile[] };
	const windows = files.filter((file) => file.channel === 'stable' && file.platform === 'windows');
	const version = windows
		.map((file) => file.version)
		.sort((a, b) => b.localeCompare(a, undefined, { numeric: true }))[0];
	if (!version) throw new Error('No stable Windows release found');

	const find = (pattern: RegExp) => {
		const file = windows.find((f) => f.version === version && pattern.test(f.file_name));
		if (!file) throw new Error(`No file matching ${pattern} for ${version}`);
		return `${api}/${file.id}`;
	};

	return {
		version,
		urls: () => [
			find(/_x64_en-US\.msi$/),
			find(/_x64-setup\.exe$/),
			find(/_arm64_en-US\.msi$/),
			find(/_arm64-setup\.exe$/),
		],
	};
});

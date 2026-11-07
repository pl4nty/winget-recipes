import { defineShard } from 'anthelion';

const base = 'https://dl.min.io/aistor/mc/release/windows-amd64';

export default defineShard(async () => {
	const response = await fetch(`${base}/mc.exe.sha256sum`);
	if (!response.ok) throw new Error(`${base}/mc.exe.sha256sum returned ${response.status}`);
	const text = await response.text();
	const match = text.match(/mc\.exe\.(?<release>RELEASE\.(?<date>\d{4}-\d{2}-\d{2})T\d{2}-\d{2}-\d{2}Z)/);
	if (!match?.groups) throw new Error('Failed to find mc release in checksum file');
	const version = match.groups.date.replaceAll('-', '.');

	return {
		version,
		urls: () => [`${base}/mc.exe.${match.groups.release}`],
	};
});

import { defineShard } from 'anthelion';

const archive = 'https://dl.min.io/server/minio/release/windows-amd64/archive/';

export default defineShard(async () => {
	const response = await fetch(archive);
	if (!response.ok) {
		throw new Error(`MinIO archive listing returned HTTP ${response.status}`);
	}
	const listing = await response.text();
	const stamps = [
		...new Set(
			Array.from(
				listing.matchAll(/minio\.RELEASE\.(\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}Z)(?=["<])/g),
				(match) => match[1]!,
			),
		),
	].sort();
	const stamp = stamps.at(-1);
	if (!stamp) {
		throw new Error('No MinIO releases found in the archive listing');
	}
	const version = stamp.slice(0, 10).replaceAll('-', '.');

	return {
		version,
		urls: () => [`${archive}minio.RELEASE.${stamp}`],
	};
});

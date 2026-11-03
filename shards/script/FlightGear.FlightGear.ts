import { defineShard } from 'anthelion';
import { compareVersions } from 'anthelion/helpers';
import ky from 'ky';

const base = 'https://mirrors.ibiblio.org/flightgear/ftp';

const latest = (values: Iterable<string>) => [...new Set(values)].sort(compareVersions).at(-1);

export default defineShard(async () => {
	const root = await ky(`${base}/`).text();
	const branch = latest([...root.matchAll(/release-(\d+\.\d+)\//g)].map((m) => m[1]!));
	if (!branch) throw new Error('No FlightGear release directory found');

	const listing = await ky(`${base}/release-${branch}/`).text();
	const version = latest(
		[...listing.matchAll(/flightgear-(\d+(?:\.\d+)+)-windows-amd64\.exe/g)].map((m) => m[1]!),
	);
	if (!version) throw new Error(`No FlightGear ${branch} Windows installer found`);

	return {
		version,
		urls: () => [`${base}/release-${branch}/flightgear-${version}-windows-amd64.exe`],
	};
});

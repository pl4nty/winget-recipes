import { defineShard } from 'anthelion';

// public.cyber.mil is a Salesforce site that renders its download table client-side,
// and dl.dod.cyber.mil keeps only the current STIG Viewer zip. So climb from the last
// known release by probing the next patch, minor and major URLs until none exist.
const knownRelease = [3, 8, 1];
const zipUrl = ([major, minor, patch]: number[]) =>
	`https://dl.dod.cyber.mil/wp-content/uploads/stigs/zip/U_STIGViewer-win32_x64-${major}-${minor}-${patch}_msi.zip`;

const exists = async (version: number[]) =>
	(await fetch(zipUrl(version), { method: 'HEAD' })).ok;

export default defineShard(async () => {
	let current = knownRelease;
	let found = await exists(current);
	for (;;) {
		const [major, minor, patch] = current as [number, number, number];
		const candidates = [
			[major + 1, 0, 0],
			[major, minor + 2, 0],
			[major, minor + 1, 0],
			[major, minor, patch + 2],
			[major, minor, patch + 1],
		];
		let next: number[] | undefined;
		for (const candidate of candidates) {
			if (await exists(candidate)) {
				next = candidate;
				break;
			}
		}
		if (!next) break;
		current = next;
		found = true;
	}
	if (!found) throw new Error('No STIG Viewer zip found on dl.dod.cyber.mil');

	return {
		version: current.join('.'),
		urls: () => [zipUrl(current)],
	};
});

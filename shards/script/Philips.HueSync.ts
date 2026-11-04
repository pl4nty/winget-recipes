import { defineShard } from 'anthelion';

type Update = { version: number; versionName: string; binaryUrl: string };

// The installer URL holds a build number and a per-build id, so both the version and the
// URL come from the update feed the Hue Sync app itself queries (version=0 lists the
// current build).
export default defineShard(async () => {
	const { updates } = (await fetch(
		'https://firmware.meethue.com/v1/checkupdate/?deviceTypeId=HueSyncWin&version=0',
	).then((response) => response.json())) as { updates: Update[] };
	const latest = updates.reduce((a, b) => (b.version > a.version ? b : a));

	return {
		version: latest.versionName,
		urls: () => [{ url: latest.binaryUrl, architecture: 'x64' }],
	};
});

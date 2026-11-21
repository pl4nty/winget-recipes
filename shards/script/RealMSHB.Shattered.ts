import { defineShard } from 'anthelion';

// Game Jolt only hands out signed, time-limited download URLs, resolved from the game's Windows build.
export default defineShard(async () => {
	const overview = (await fetch('https://gamejolt.com/site-api/web/discover/games/overview/359015').then((response) => response.json())) as {
		payload: {
			releases: { id: number; version_number: string }[];
			builds: { id: number; game_release_id: number; os_windows: boolean | null; type: string }[];
		};
	};
	const build = overview.payload.builds.find((entry) => entry.os_windows && entry.type === 'downloadable');
	if (!build) throw new Error('No downloadable Windows build on Game Jolt');
	const release = overview.payload.releases.find((entry) => entry.id === build.game_release_id);
	if (!release) throw new Error('No release for the Windows build on Game Jolt');

	return {
		version: release.version_number,
		urls: async () => {
			const download = (await fetch(`https://gamejolt.com/site-api/web/discover/games/builds/get-download-url/${build.id}`, {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: '{}',
			}).then((response) => response.json())) as { payload: { url: string } };
			return [download.payload.url];
		},
	};
});

import { defineShard } from 'anthelion';
import { compareVersions } from 'anthelion/helpers';
import ky from 'ky';

// Each MCX Studio release has a directory under nightly/release/ (v2025.10/, v2026/, ...) holding
// the Windows installer. Package versions keep the leading "v" used by the installer file name.
const base = 'https://mcx.space/nightly/release/';

function latest(values: string[]) {
	return [...new Set(values)].sort(compareVersions).at(-1);
}

export default defineShard(async () => {
	const listing = await ky(base, { timeout: 60_000 }).text();
	const release = latest([...listing.matchAll(/href="v(\d+(?:\.\d+)*)\/"/g)].map(([, v]) => v!));
	if (!release) {
		throw new Error('No MCX Studio release directory found');
	}

	const directory = `${base}v${release}/`;
	const files = await ky(directory, { timeout: 60_000 }).text();
	const installers = new Map(
		[...files.matchAll(/href="(MCXStudio-(?:windows-x64-)?v(\d+(?:\.\d+)*)-installer\.exe)"/g)].map(
			([, file, v]) => [v!, file!],
		),
	);
	const fileVersion = latest([...installers.keys()]);
	if (!fileVersion) {
		throw new Error(`No Windows installer found in ${directory}`);
	}

	return {
		version: `v${fileVersion}`,
		urls: () => [`${directory}${installers.get(fileVersion)}`],
		releaseNotes: {
			releaseNotesUrl: `https://mcx.space/wiki/index.cgi?Doc/ReleaseNotes/v${release}`,
		},
	};
});

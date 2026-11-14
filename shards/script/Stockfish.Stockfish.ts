import { defineShard } from 'anthelion';
import { getLatestRelease } from 'anthelion/github';

// Tags are sf_19, sf_17.1, ...; upstream versions are 19.0, 17.1, ...
export default defineShard(async () => {
	const release = await getLatestRelease({
		owner: 'official-stockfish',
		repo: 'Stockfish',
		tagRegex: '^sf_',
	});
	const version = release.version.includes('.') ? release.version : `${release.version}.0`;

	return {
		version,
		urls: () => [
			`https://github.com/official-stockfish/Stockfish/releases/download/${release.rawTag}/stockfish-windows-x86-64-universal.zip`,
			`https://github.com/official-stockfish/Stockfish/releases/download/${release.rawTag}/stockfish-windows-arm64-universal.zip`,
		],
		releaseNotes: {
			source: 'github',
			owner: 'official-stockfish',
			repo: 'Stockfish',
			tag: release.rawTag,
		},
	};
});

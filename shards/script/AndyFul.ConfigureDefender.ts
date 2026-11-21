import { defineShard } from 'anthelion';
import { getLatestFileCommit } from 'anthelion/github';
import { match } from 'anthelion/helpers';

// ConfigureDefender.exe has no version strings, so the version comes from What_is_new.txt at the same commit.
export default defineShard(async () => {
	const commit = await getLatestFileCommit({ owner: 'AndyFul', repo: 'ConfigureDefender', path: 'ConfigureDefender.exe' });
	const notes = await (await fetch(`https://raw.githubusercontent.com/AndyFul/ConfigureDefender/${commit}/What_is_new.txt`)).text();
	const {
		captures: { version },
	} = match(notes, /^Version (?<version>\d+(?:\.\d+)+)/m, 'No version in What_is_new.txt');

	return {
		version,
		state: commit,
		urls: () => [`https://raw.githubusercontent.com/AndyFul/ConfigureDefender/${commit}/ConfigureDefender.exe`],
		releaseNotes: { releaseNotesUrl: `https://github.com/AndyFul/ConfigureDefender/blob/${commit}/What_is_new.txt` },
	};
});

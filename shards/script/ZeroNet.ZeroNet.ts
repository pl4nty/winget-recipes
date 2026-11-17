import { defineShard } from 'anthelion';
import { getLatestFileCommit } from 'anthelion/github';
import { match } from 'anthelion/helpers';

// The Windows build lives on the dist-win64 branch (no releases or tags), and
// its exe has no version resource, so read the version from the bundled
// Config.py at the latest commit and pin the archive to that commit.
export default defineShard(async () => {
	const commit = await getLatestFileCommit({
		owner: 'HelloZeroNet',
		repo: 'ZeroNet-win',
		branch: 'dist-win64',
		path: 'core/src/Config.py',
	});
	const config = await fetch(
		`https://raw.githubusercontent.com/HelloZeroNet/ZeroNet-win/${commit}/core/src/Config.py`,
	).then((response) => response.text());
	const {
		captures: { version },
	} = match(config, /self\.version = "(?<version>\d+(?:\.\d+)+)"/, 'No version in ZeroNet Config.py');

	return {
		version,
		urls: () => [`https://github.com/HelloZeroNet/ZeroNet-win/archive/${commit}.zip`],
		state: commit,
	};
});

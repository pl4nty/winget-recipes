import { defineShard } from 'anthelion';
import { getLatestFileCommit } from 'anthelion/github';
import { match } from 'anthelion/helpers';

export default defineShard(async () => {
	const commit = await getLatestFileCommit({ owner: 'turtle170', repo: 'dEXE', path: 'dexe.zip' });
	const cargo = await fetch(`https://raw.githubusercontent.com/turtle170/dEXE/${commit}/Cargo.toml`).then((response) =>
		response.text(),
	);
	const [version] = match(cargo, /^version = "(.+)"$/gm).groups;

	return {
		version,
		state: commit,
		urls: () => [`https://github.com/turtle170/dEXE/raw/${commit}/dexe.zip`],
	};
});

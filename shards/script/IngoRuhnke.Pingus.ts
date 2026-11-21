import { defineShard } from 'anthelion';
import { githubClient } from 'anthelion/github';
import { match } from 'anthelion/helpers';

// The vendor's download page links the Windows installer in the Pingus/downloads
// repository; the raw URL is pinned to the commit that last touched that file.
export default defineShard(async () => {
	const page = await fetch('https://pingus.seul.org/download.html').then((response) => response.text());
	const {
		captures: { version },
	} = match(page, /github\.com\/Pingus\/downloads\/blob\/master\/Pingus-(?<version>\d+(?:\.\d+)+)\.exe/);
	const file = `Pingus-${version}.exe`;
	const { data: commits } = await githubClient.rest.repos.listCommits({
		owner: 'Pingus',
		repo: 'downloads',
		path: file,
		per_page: 1,
	});
	const commit = commits[0]?.sha;
	if (!commit) throw new Error(`No commit found for ${file}`);

	return {
		version,
		urls: () => [`https://raw.githubusercontent.com/Pingus/downloads/${commit}/${file}`],
	};
});

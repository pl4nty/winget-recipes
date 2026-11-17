import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';

// The Windows zip is a GitLab upload linked from the release description,
// under a per-upload hash, so read it from the latest release.
type Release = {
	tag_name: string;
	description: string;
	_links: { self: string };
};

export default defineShard(async () => {
	const [release]: Release[] = await fetch(
		'https://gitlab.com/api/v4/projects/3655713/releases?per_page=1',
	).then((response) => response.json());
	if (!release) throw new Error('No mtn release found');
	const {
		captures: { version },
	} = match(release.tag_name, /^v(?<version>\d+(?:\.\d+)+)$/);
	const {
		captures: { path },
	} = match(release.description, /\((?<path>\/uploads\/[0-9a-f]+\/mtn-[^)]*-win64\.zip)\)/);

	return {
		version,
		urls: () => [{ url: `https://gitlab.com/-/project/3655713${path}` }],
		releaseNotes: { releaseNotesUrl: release._links.self },
	};
});

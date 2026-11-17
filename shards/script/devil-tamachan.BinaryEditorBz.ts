import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';

// Releases are on GitLab and the installers are uploads linked from the release description, under a per-file hash.
type Release = { tag_name: string; description: string; _links: { self: string } };

export default defineShard(async () => {
	const [release]: Release[] = await fetch(
		'https://gitlab.com/api/v4/projects/devill.tamachan%2Fbinaryeditorbz/releases?per_page=1',
	).then((response) => response.json());
	if (!release) throw new Error('No BinaryEditorBz release found');
	const version = release.tag_name;
	const upload = (file: RegExp, name: string) =>
		`https://gitlab.com/devill.tamachan/binaryeditorbz${match(release.description, file, `No ${name} in release ${version}`).captures.path}`;
	const escaped = version.replaceAll('.', '\\.');
	const setup = upload(new RegExp(`(?<path>/uploads/[0-9a-f]+/BzEditor-${escaped}\\.exe)`), 'installer');
	const portable = upload(new RegExp(`(?<path>/uploads/[0-9a-f]+/Bz${version.replaceAll('.', '')}Portable\\.zip)`), 'portable zip');

	return {
		version,
		urls: () => [setup, portable],
		releaseNotes: { releaseNotesUrl: release._links.self },
	};
});

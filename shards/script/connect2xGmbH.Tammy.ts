import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';

// Tammy releases are tagged v<major>.<minor>.<patch>, but the MSIX identity (and upstream PackageVersion)
// is <major>.0.<minor>.<patch> (v1.0.9 -> 1.0.0.9, v26.11.0 -> 26.0.11.0). komac reads no version from the MSIX.
export default defineShard(async () => {
	const [release] = (await (await fetch('https://gitlab.com/api/v4/projects/61851918/releases?per_page=1')).json()) as { tag_name: string }[];
	const {
		captures: { major, minor, patch },
	} = match(release?.tag_name, /^v(?<major>\d+)\.(?<minor>\d+)\.(?<patch>\d+)$/, 'No stable Tammy release found');
	const tag = `${major}.${minor}.${patch}`;

	return {
		version: `${major}.0.${minor}.${patch}`,
		urls: () => [`https://gitlab.com/api/v4/projects/61851918/packages/generic/Tammy-Windows-x64.msix/${tag}/Tammy-Windows-x64-${tag}.msix`],
		releaseNotes: { releaseNotesUrl: `https://gitlab.com/connect2x/tammy/-/releases/v${tag}` },
	};
});

import { defineShard } from 'anthelion';
import { getLatestFileCommit } from 'anthelion/github';
import { match } from 'anthelion/helpers';

// The installer is committed to main and carries no version resource, so read the version from the changelog
// at the commit that last changed the installer.
export default defineShard(async () => {
	const commit = await getLatestFileCommit({
		owner: 'SagMeinenNamen',
		repo: 'SecretChat',
		path: 'Output/SecretChat-Installer.exe',
	});
	const notes = await fetch(`https://raw.githubusercontent.com/SagMeinenNamen/SecretChat/${commit}/Update-Infos.md`).then(
		(response) => response.text(),
	);
	const {
		captures: { version },
	} = match(notes, /^\s*#\s*Version\s+(?<version>\d+(?:\.\d+)+):/m, 'No version in Update-Infos.md');

	return {
		version,
		urls: () => [`https://raw.githubusercontent.com/SagMeinenNamen/SecretChat/${commit}/Output/SecretChat-Installer.exe`],
		state: commit,
		releaseNotes: {
			releaseNotesUrl: `https://github.com/SagMeinenNamen/SecretChat/blob/${commit}/Update-Infos.md`,
		},
	};
});

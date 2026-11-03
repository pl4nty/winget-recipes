import { defineShard } from 'anthelion';

export default defineShard(async () => {
	const { version: commit, productVersion: version } = await fetch(
		'https://update.code.visualstudio.com/api/update/win32-x64-user/stable/latest',
	).then((response) => response.json());
	const [major, minor] = version.split('.');

	return {
		version,
		urls: () => [
			`https://vscode.download.prss.microsoft.com/dbazure/download/stable/${commit}/VSCodeUserSetup-x64-${version}.exe`,
			`https://vscode.download.prss.microsoft.com/dbazure/download/stable/${commit}/VSCodeSetup-x64-${version}.exe`,
			`https://vscode.download.prss.microsoft.com/dbazure/download/stable/${commit}/VSCodeUserSetup-arm64-${version}.exe`,
			`https://vscode.download.prss.microsoft.com/dbazure/download/stable/${commit}/VSCodeSetup-arm64-${version}.exe`,
		],
		releaseNotes: {
			releaseNotesUrl: `https://code.visualstudio.com/updates/v${major}_${minor}`,
		},
	};
});

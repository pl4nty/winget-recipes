import { defineShard } from 'anthelion';
import { getLatestRelease } from 'anthelion/github';

// meganz/MEGAsync tags each platform separately (v6.7.0.3_Win, _OSX, _Linux), so pick the
// latest Windows release. MEGA only serves the installers from unversioned mega.nz URLs.
export default defineShard(async () => {
	const release = await getLatestRelease({
		owner: 'meganz',
		repo: 'MEGAsync',
		tagRegex: '_Win$',
	});

	return {
		version: release.version,
		urls: () => ['https://mega.nz/MEGAsyncSetup32.exe', 'https://mega.nz/MEGAsyncSetup64.exe'],
		releaseNotes: {
			source: 'github',
			owner: 'meganz',
			repo: 'MEGAsync',
			tag: release.rawTag,
		},
	};
});

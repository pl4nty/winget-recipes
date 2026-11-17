import { defineShard } from 'anthelion';
import { getLatestRelease } from 'anthelion/github';
import { match } from 'anthelion/helpers';

// Release tags are WWTExplorer@<major>.<minor>.<patch>.0, but upstream PackageVersion
// drops the trailing ".0" (6.1.2), which a JSON tagRegex can't remove together with the prefix.
export default defineShard(async () => {
	const release = await getLatestRelease({
		owner: 'WorldWideTelescope',
		repo: 'wwt-windows-client',
		tagRegex: '^WWTExplorer@',
		sortByVersion: true,
	});
	const {
		captures: { version },
	} = match(release.version, /^(?<version>\d+\.\d+\.\d+)\.0$/, `Unexpected WWTExplorer release version ${release.version}`);

	return {
		version,
		urls: () => [`https://web.wwtassets.org/releases/wwt/wwtsetup-${release.version}.msi`],
		releaseNotes: { source: 'github', owner: 'WorldWideTelescope', repo: 'wwt-windows-client', tag: release.rawTag, cleanup: false },
	};
});

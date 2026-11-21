import { defineShard } from 'anthelion';
import { getLatestRelease } from 'anthelion/github';
import { match } from 'anthelion/helpers';

// Release tags are release-YYYYMMDD, and winget-pkgs files them as YYYY.MM.DD.
export default defineShard(async () => {
	const { rawTag } = await getLatestRelease({ owner: 'OpenRA', repo: 'OpenRA', tagRegex: '^release-', sortByVersion: true });
	const {
		captures: { year, month, day },
	} = match(rawTag, /^release-(?<year>\d{4})(?<month>\d{2})(?<day>\d{2})$/, `Unexpected OpenRA tag ${rawTag}`);

	return {
		version: `${year}.${month}.${day}`,
		urls: () => [
			{ url: `https://github.com/OpenRA/OpenRA/releases/download/${rawTag}/OpenRA-${rawTag}-x86.exe`, architecture: 'x86' },
			{ url: `https://github.com/OpenRA/OpenRA/releases/download/${rawTag}/OpenRA-${rawTag}-x64.exe`, architecture: 'x64' },
		],
		releaseNotes: { releaseNotesUrl: `https://github.com/OpenRA/OpenRA/releases/tag/${rawTag}` },
	};
});

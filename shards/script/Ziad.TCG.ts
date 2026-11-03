import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';

// Installer file names change between releases (OS range suffixes), so read the
// newest version folder and its amd64/x86 setup exes from the SourceForge RSS feed.
const feed = 'https://sourceforge.net/projects/temp-cleaner-gui/rss?path=/';

export default defineShard(async () => {
	const rss = await fetch(feed).then((response) => response.text());
	const {
		captures: { version },
	} = match(rss, /\/v(?<version>\d+(?:\.\d+)+-stable)\/temp_cleaner_gui_v/);
	const folder = `v${version}`;
	const file = (arch: string) => {
		const escaped = folder.replace(/[.]/g, '\\.');
		const {
			groups: [name],
		} = match(rss, new RegExp(`/${escaped}/(temp_cleaner_gui_${escaped}_${arch}_[^/\\]<]*_mrx\\.exe)`));
		return `https://sourceforge.net/projects/temp-cleaner-gui/files/${folder}/${name}`;
	};

	return {
		version,
		urls: () => [file('amd64'), file('x86')],
		releaseNotes: { source: 'github', owner: 'InsertX2k', repo: 'temp_cleaner_gui', tag: folder },
		replace: true,
	};
});

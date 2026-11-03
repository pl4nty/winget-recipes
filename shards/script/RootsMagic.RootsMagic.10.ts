import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';

// RootsMagic 10 download URLs are unversioned. The vendor's update history topic lists every
// release (all major versions) as "<version> - <date>" headings; the newest 10.x entry gives the
// version and becomes the release notes, passed as a data: URL so other entries are left out.
const topic = 'https://community.rootsmagic.com/t/rootsmagic-update-history/6700';

export default defineShard(async () => {
	const { post_stream } = (await fetch(`${topic}.json`).then((response) => response.json())) as {
		post_stream: { posts: { cooked: string }[] };
	};
	const {
		groups: [entry],
		captures: { version },
	} = match(
		post_stream.posts[0]!.cooked,
		/(<p><strong>(?<version>10\.\d+\.\d+) - [^<]*<\/strong><\/p>[\s\S]*?)(?=<p><strong>\d+\.\d+\.\d+ - |$)/,
	);

	return {
		version: `${version}.0`,
		urls: () => [
			{ url: 'https://files.rootsmagic.com/RM10/RootsMagic10Setup.exe', architecture: 'x86' },
			{ url: 'https://files.rootsmagic.com/RM10/RootsMagic10SetupX64.exe', architecture: 'x64' },
		],
		releaseNotes: {
			source: 'html',
			sourceUrl: `data:text/html,${encodeURIComponent(entry)}`,
			releaseNotesUrl: topic,
			cleanup: false,
		},
		replace: true,
	};
});

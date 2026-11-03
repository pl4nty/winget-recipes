import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';

// The version comes from the vendor's Windows install page. The release notes
// URL is a dated blog post, so it is looked up on the blog index by the
// version without dots (nim-2212.html for 2.2.12).
export default defineShard(async () => {
	const install = await fetch('https://nim-lang.org/install_windows.html').then((response) => response.text());
	const {
		captures: { version },
	} = match(install, /href="\/download\/nim-(?<version>\d+(?:\.\d+)+)_x64\.zip"/);

	const blog = await fetch('https://nim-lang.org/blog.html').then((response) => response.text());
	const slug = version.replaceAll('.', '');
	const post = blog.match(new RegExp(`href="(/blog/\\d{4}/\\d{2}/\\d{2}/nim-${slug}\\.html)"`))?.[1];

	return {
		version,
		urls: () => [
			`https://nim-lang.org/download/nim-${version}_x64.zip`,
			`https://nim-lang.org/download/nim-${version}_x32.zip`,
		],
		...(post ? { releaseNotes: { releaseNotesUrl: `https://nim-lang.org${post}` } } : {}),
	};
});

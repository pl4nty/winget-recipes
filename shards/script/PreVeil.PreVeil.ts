import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';

// The vendor's product updates post lists each release as "Version x.y.z | Month Year"
// with its notes. The MSI lives under a per-build commit hash on the vendor's S3 bucket,
// linked from the install-latest-release page's download block.
export default defineShard(async () => {
	const page = 'https://www.preveil.com/blog/product-updates/';
	const blog = await fetch(page).then((response) => response.text());
	const {
		captures: { version, notes },
	} = match(
		blog,
		/<h2[^>]*>Version (?<version>\d+(?:\.\d+)+) \|[^<]*<\/h2>(?<notes>[\s\S]*?)(?=<h2 |<\/section>)/,
	);

	const download = await fetch('https://www.preveil.com/install-latest-release/').then((response) => response.text());
	const {
		captures: { url },
	} = match(
		download,
		/(?<url>https:\/\/s3\.amazonaws\.com\/pv-bin-storage\/ci\/desktop\/win\/[0-9a-f]{40}\/PreVeilInstaller\.msi)/,
		'No Windows MSI link found on the PreVeil download page',
	);

	return {
		version,
		urls: () => [{ url, architecture: 'x64' }],
		releaseNotes: {
			source: 'html',
			sourceUrl: `data:text/html,${encodeURIComponent(notes.replace(/<p[^>]*><a [^>]*>Download Version[^<]*<\/a><\/p>/, ''))}`,
			releaseNotesUrl: page,
			cleanup: false,
		},
	};
});

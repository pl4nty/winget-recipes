import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';

// Stable releases live in /itk-snap/<version>/ on SourceForge and the installer
// name carries a build date, so take the newest stable folder, then its file.
export default defineShard(async () => {
	const listing = await fetch('https://sourceforge.net/projects/itk-snap/files/itk-snap/').then((response) =>
		response.text(),
	);
	const versions = [...new Set([...listing.matchAll(/\/files\/itk-snap\/(\d+\.\d+\.\d+)\//g)].map((m) => m[1]!))];
	const compare = (a: string, b: string) => {
		const pa = a.split('.').map(Number);
		const pb = b.split('.').map(Number);
		for (let i = 0; i < 3; i++) if (pa[i] !== pb[i]) return pa[i]! - pb[i]!;
		return 0;
	};
	const version = versions.sort(compare).at(-1);
	if (!version) throw new Error('No stable ITK-SNAP release found');

	const feed = await fetch(`https://sourceforge.net/projects/itk-snap/rss?path=/itk-snap/${version}`).then(
		(response) => response.text(),
	);
	const {
		captures: { file },
	} = match(feed, new RegExp(`/itk-snap/${version.replaceAll('.', '\\.')}/(?<file>itksnap-${version.replaceAll('.', '\\.')}(?:-\\d+)?-win64-AMD64\\.exe)`));

	return {
		version,
		urls: () => [`https://sourceforge.net/projects/itk-snap/files/itk-snap/${version}/${file}/download`],
	};
});

import { defineShard } from 'anthelion';

// Releases link the Windows installer to the CI job's artifact browser (through a short link), so the installer URL is built from that job.
const PROJECT = 'https://gitlab.com/api/v4/projects/ryzen-controller-team%2Fryzen-controller';

type Release = { tag_name: string; upcoming_release: boolean; assets: { links: { name: string; url: string }[] } };

export default defineShard(async () => {
	const releases: Release[] = await fetch(`${PROJECT}/releases?per_page=20`).then((response) => response.json());
	const release = releases.find((item) => !item.upcoming_release && /^\d+(?:\.\d+)+$/.test(item.tag_name));
	if (!release) throw new Error('No Ryzen Controller release found');
	const version = release.tag_name;
	const link = release.assets.links.find((item) => /windows/i.test(item.name));
	if (!link) throw new Error(`No Windows installer link in Ryzen Controller ${version}`);

	let location = link.url;
	if (!/gitlab\.com/.test(location)) {
		const response = await fetch(location, { method: 'HEAD', redirect: 'manual' });
		location = response.headers.get('location') ?? '';
	}
	const job = /\/ryzen-controller\/-\/jobs\/(\d+)\//.exec(location)?.[1];
	if (!job) throw new Error(`No CI job found for Ryzen Controller ${version}: ${location}`);

	return {
		version,
		urls: () => [
			`https://gitlab.com/ryzen-controller-team/ryzen-controller/-/jobs/${job}/artifacts/raw/dist/win/Ryzen%20Controller%20Setup%20${version}.exe`,
		],
		releaseNotes: { releaseNotesUrl: `https://gitlab.com/ryzen-controller-team/ryzen-controller/-/releases/${version}` },
	};
});

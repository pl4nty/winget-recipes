import { defineShard } from 'anthelion';
import { githubClient } from 'anthelion/github';
import { match } from 'anthelion/helpers';

export default defineShard(async () => {
	const tags = await githubClient.paginate(githubClient.rest.repos.listTags, {
		owner: 'rmyorston',
		repo: 'busybox-w32',
		per_page: 100,
	});
	const [tag] = tags
		.map(({ name }) => name)
		.filter((name) => /^FRP-\d+-g[0-9a-f]+$/.test(name))
		.sort((a, b) => Number(b.split('-')[1]) - Number(a.split('-')[1]));
	if (!tag) throw new Error('No FRP tag found');

	const makefile = await fetch(
		`https://raw.githubusercontent.com/rmyorston/busybox-w32/${tag}/Makefile`,
	).then((response) => response.text());
	const { captures } = match(
		makefile,
		/^VERSION = (?<major>\d+)\s+PATCHLEVEL = (?<minor>\d+)\s+SUBLEVEL = (?<patch>\d+)/m,
	);

	return {
		version: `${captures.major}.${captures.minor}.${captures.patch}-${tag}`,
		urls: () => [
			`https://frippery.org/files/busybox/busybox-w32-${tag}.exe`,
			`https://frippery.org/files/busybox/busybox-w64-${tag}.exe`,
			`https://frippery.org/files/busybox/busybox-w64a-${tag}.exe`,
		],
	};
});

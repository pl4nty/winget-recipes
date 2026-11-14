import { defineShard } from 'anthelion';
import { msDownloadCenter } from 'anthelion/strategies';

export default defineShard(async () => {
	const year = new Date().getUTCFullYear() % 100;
	const queries = ['', `${year - 1}H2`, `${year}H2`].map(
		(release) => `Administrative Templates (.admx) for Windows 11 ${release}`,
	);
	const pages = await Promise.all(
		queries.map((q) =>
			fetch(`https://www.microsoft.com/en-us/search/explore?${new URLSearchParams({ q })}`).then(
				(response) => response.text(),
			),
		),
	);
	const ids = new Set(
		pages.flatMap((page) =>
			[...page.matchAll(/download\/details\.aspx\?id=(\d+)/g)].map((m) => Number(m[1])),
		),
	);
	const releases = await Promise.all(
		[...ids].map(async (id) => {
			const page = await fetch(
				`https://www.microsoft.com/en-us/download/details.aspx?id=${id}`,
			).then((response) => response.text());
			const release = page.match(
				/"downloadTitle":"Administrative Templates \(\.admx\) for Windows 11 [^"]*\((\d\dH\d)\)/,
			)?.[1];
			return release ? { id, release } : [];
		}),
	);
	const [latest] = releases
		.flat()
		.sort((a, b) => b.release.localeCompare(a.release) || b.id - a.id);
	if (!latest)
		throw new Error('No Windows 11 Administrative Templates found in Download Center search');
	const { urls } = await msDownloadCenter({ id: latest.id });

	return {
		version: `11.${latest.release}`,
		urls: () => urls,
	};
});

import { defineShard } from 'anthelion';

// Hardcopy is versioned by release date (yyyy.mm.dd) and only published as an
// unversioned hc.exe, whose own version resource stays at 4.42, so take the
// date from the file's Last-Modified header.
const url = 'https://hardcopy.de/hc.exe';

export default defineShard(async () => {
	const response = await fetch(url, { method: 'HEAD' });
	const lastModified = response.headers.get('last-modified');
	if (!response.ok || !lastModified) throw new Error(`No Last-Modified for ${url}`);
	const date = new Date(lastModified);
	const pad = (n: number) => String(n).padStart(2, '0');
	const version = `${date.getUTCFullYear()}.${pad(date.getUTCMonth() + 1)}.${pad(date.getUTCDate())}`;

	return {
		version,
		urls: () => [url],
	};
});

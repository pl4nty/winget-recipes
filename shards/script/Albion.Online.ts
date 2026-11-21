import { defineShard } from 'anthelion';

const url = 'https://live.albiononline.com/clients/albion-online-setup.exe';

export default defineShard(async () => {
	const response = await fetch(url, { method: 'HEAD' });
	if (!response.ok) throw new Error(`HEAD ${url} returned ${response.status}`);
	const lastModified = response.headers.get('last-modified');
	if (!lastModified) throw new Error('Missing Last-Modified header');
	const date = new Date(lastModified);
	const pad = (value: number) => value.toString().padStart(2, '0');
	const version = `${pad(date.getUTCFullYear() % 100)}.${pad(date.getUTCMonth() + 1)}.${pad(date.getUTCDate())}`;

	return {
		version,
		urls: () => [{ url, architecture: 'x64' }],
	};
});

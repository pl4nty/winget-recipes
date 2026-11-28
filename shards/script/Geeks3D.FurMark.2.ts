import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';

export default defineShard(async () => {
	const page = await fetch('https://geeks3d.com/furmark/downloads/').then((response) => response.text());
	const download = (build: string) =>
		match(page, new RegExp(`href="/dl/show/(?<id>\\d+)"[^>]*>v(?<version>\\d+(?:\\.\\d+)+) - ${build}</a>`)).captures;
	const win32Zip = download('win32 - \\(zip\\)');
	const win64Zip = download('win64 - \\(zip\\)');
	const win64Setup = download('win64 - \\(installer\\)');
	const resolve = async (id: string) => {
		const response = await fetch(`https://geeks3d.com/dl/get/${id}`, { method: 'HEAD', redirect: 'manual' });
		const location = response.headers.get('location');
		if (!location) throw new Error(`No redirect for download ${id}`);
		return location;
	};

	return {
		version: win64Setup.version,
		urls: async () => [
			await resolve(win32Zip.id),
			await resolve(win64Zip.id),
			await resolve(win64Setup.id),
		],
	};
});

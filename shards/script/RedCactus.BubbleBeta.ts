import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';

const url = 'https://api.eu.redcactus.cloud/v1/public/software/download/494342c8-f3e9-491d-b6f2-4654c8ac8cbd';

export default defineShard(async () => {
	const response = await fetch(url, { method: 'HEAD' });
	const {
		groups: [version],
	} = match(
		response.headers.get('content-disposition'),
		/filename="?Bubble-win-x64-(\d+(?:\.\d+)+)\.msi/i,
		'Bubble MSI file name not found in Content-Disposition',
	);

	return {
		version: version!,
		urls: () => [url],
		replace: true,
	};
});

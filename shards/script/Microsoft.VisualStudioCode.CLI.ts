import { defineShard } from 'anthelion';

export default defineShard(async () => {
	const updates = await Promise.all(
		['arm64', 'x64'].map((arch) =>
			fetch(`https://update.code.visualstudio.com/api/update/cli-win32-${arch}/stable/latest`).then((response) =>
				response.json(),
			),
		),
	);

	return {
		version: updates[0].productVersion,
		urls: () => updates.map(({ url }) => url),
	};
});

import { defineShard } from 'anthelion';

type Files = Record<string, Record<string, { files: { name: string; file_name: string }[] }>>;

// Not every SDK release ships a runtime installer, so take the newest one that does.
export default defineShard(async () => {
	const files = (await fetch('https://vulkan.lunarg.com/sdk/files.json').then((response) => response.json())) as Files;
	const runtime = (platform: string, version: string) => files[platform]?.[version]?.files.find(({ name }) => name === 'Runtime')?.file_name;
	const version = Object.keys(files.windows!).find((version) => runtime('windows', version) && runtime('warm', version));
	if (!version) throw new Error('No release with runtime installers');
	return {
		version,
		urls: () => [`https://sdk.lunarg.com/sdk/download/${version}/windows/${runtime('windows', version)}`, `https://sdk.lunarg.com/sdk/download/${version}/warm/${runtime('warm', version)}`],
	};
});

import { defineShard } from 'anthelion';

export default defineShard(async () => {
	const [x86, x64] = await Promise.all(
		['x86', 'x64'].map((arch) =>
			fetch(`https://ams.ecosia-browser.net/api/getLatest/0aac13df-2a94-4570-8229-285102897d3d/win/?channelprofilename=PROD&arch=${arch}`).then(
				(response) => response.json() as Promise<{ Version: string }>,
			),
		),
	);
	if (x86!.Version !== x64!.Version) throw new Error(`Inconsistent versions: x86 ${x86!.Version}, x64 ${x64!.Version}`);
	return {
		version: x64!.Version,
		urls: () => ['x86', 'x64'].map((arch) => `https://app-cms-repo.ecosia-browser.net/0aac13df-2a94-4570-8229-285102897d3d/build/${x64!.Version}/mini_installer_${x64!.Version}_${arch}.exe`),
	};
});

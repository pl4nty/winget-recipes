import { defineShard } from 'anthelion';

// Recent GitHub releases no longer attach the nupkg.
export default defineShard(async () => {
	const { versions } = await fetch('https://api.nuget.org/v3-flatcontainer/microsoft.windows.cswinrt/index.json').then(
		(response) => response.json() as Promise<{ versions: string[] }>,
	);
	const version = versions.filter((version) => !version.includes('-')).at(-1)!;

	return {
		version,
		urls: () => [
			{
				url: `https://globalcdn.nuget.org/packages/microsoft.windows.cswinrt.${version}.nupkg`,
				architecture: 'neutral',
				nestedInstallerMatches: ['cswinrt.exe', 'IIDOptimizer.exe'],
			},
		],
	};
});

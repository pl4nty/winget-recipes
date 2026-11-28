import { defineShard } from 'anthelion';
import { appinstaller } from 'anthelion/strategies';

// The MSIX declares no ProcessorArchitecture, but its payload (Autobench.exe) is x64, so the installer is marked x64.
export default defineShard(async () => {
	const { version, urls } = await appinstaller({
		url: 'https://apps.interfacefluidics.com/autobench/beta/autobench-installer-beta.appinstaller',
	});

	return {
		version,
		urls: () => urls.map((url) => ({ url, architecture: 'x64' as const })),
	};
});

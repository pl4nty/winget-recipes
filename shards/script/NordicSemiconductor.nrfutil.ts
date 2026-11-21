import { defineShard } from 'anthelion';
import { compareVersions } from 'anthelion/helpers';

// The launcher executables carry a commit hash after the version
// (nrfutil-x86_64-pc-windows-msvc-1.4.2-8a9090a.exe), so the newest one is
// picked from Nordic's Artifactory folder listing.
const folder = 'swtools/external/nrfutil/executables/x86_64-pc-windows-msvc';

export default defineShard(async () => {
	const listing = (await fetch(`https://files.nordicsemi.com/artifactory/api/storage/${folder}/`).then((response) =>
		response.json(),
	)) as { children: { uri: string }[] };
	const files = listing.children
		.map(({ uri }) => /^\/nrfutil-x86_64-pc-windows-msvc-(?<version>\d+(?:\.\d+)+)-(?<hash>[0-9a-f]+)\.exe$/.exec(uri)?.groups)
		.filter((groups) => groups !== undefined);
	if (files.length === 0) throw new Error('No nrfutil launcher found in Artifactory listing');
	const latest = files.sort((a, b) => compareVersions(a.version!, b.version!)).at(-1)!;

	return {
		version: latest.version!,
		urls: () => [
			{
				url: `https://files.nordicsemi.com/artifactory/${folder}/nrfutil-x86_64-pc-windows-msvc-${latest.version}-${latest.hash}.exe`,
				architecture: 'x64',
			},
		],
	};
});

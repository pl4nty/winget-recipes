import { defineShard } from 'anthelion';
import { compareVersions } from 'anthelion/helpers';
import ky from 'ky';

type Releases = Record<
	string,
	{
		updates: Record<string, Record<string, { ea: string; assets: Record<string, Record<string, Record<string, { url: string }>>> }>>;
	}
>;

// SapMachine's release index lists every update of a major version; GitHub's release list is
// dominated by newer early-access builds, so read the 24 updates from the index instead.
export default defineShard(async () => {
	const releases = await ky('https://sap.github.io/SapMachine/assets/data/sapmachine-releases-all.json', {
		timeout: 60_000,
		retry: 3,
	}).json<Releases>();
	const installers = Object.values(releases['24']?.updates ?? {})
		.flatMap((tags) => Object.values(tags))
		.filter((tag) => tag.ea === 'false')
		.map((tag) => tag.assets.jdk?.['windows-x64']?.msi?.url)
		.filter((url): url is string => url !== undefined)
		.map((url) => ({ url, version: /sapmachine-jdk-(\d+(?:\.\d+)*)_windows-x64_bin\.msi$/.exec(url)?.[1] }))
		.filter((installer): installer is { url: string; version: string } => installer.version !== undefined);
	const latest = installers.sort((a, b) => compareVersions(a.version, b.version)).at(-1);
	if (!latest) throw new Error('No SapMachine 24 JDK MSI found');

	return {
		version: latest.version,
		urls: () => [latest.url],
	};
});

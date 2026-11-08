import { githubClient } from 'anthelion/github';
import { compareVersions } from 'anthelion/helpers';

// Latest version of a package in microsoft/winget-pkgs, for update endpoints that need the current version.
export async function latestUpstreamVersion(packageIdentifier: string) {
	const path = `manifests/${packageIdentifier[0]!.toLowerCase()}/${packageIdentifier.replaceAll('.', '/')}`;
	const { data } = await githubClient.rest.repos.getContent({ owner: 'microsoft', repo: 'winget-pkgs', path });
	if (!Array.isArray(data)) throw new Error(`${path} is not a folder`);
	const [latest] = data
		.filter(({ type, name }) => type === 'dir' && /^\d/.test(name))
		.map(({ name }) => name)
		.sort((a, b) => compareVersions(b, a));
	if (!latest) throw new Error(`No versions in ${path}`);
	return latest;
}

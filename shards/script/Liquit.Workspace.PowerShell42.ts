import { defineShard } from 'anthelion';
import { compareVersions } from 'anthelion/helpers';

// This Id tracks the Liquit Workspace 4.2 branch. Download URLs embed the branch and build
// (release/<branch>/<build>/...), which a JSON shard cannot split out of the version.
export default defineShard(async () => {
	const feed = (await (await fetch('https://download.liquit.com/updates/liquitworkspace/production.json')).json()) as {
		items: { _liquit: { branch: string; version: string } }[];
	};
	const branch = '4.2';
	const version = feed.items
		.map((item) => item._liquit)
		.filter((item) => item.branch === branch)
		.map((item) => item.version)
		.sort(compareVersions)
		.at(-1);
	if (!version) throw new Error(`No Liquit Workspace ${branch} release in the production feed`);
	const build = version.split('.')[2];

	return {
		version,
		urls: () => [{ url: `https://download.liquit.com/release/${branch}/${build}/Liquit-Workspace-PowerShell-${version}.msi`, architecture: 'neutral' }],
		releaseNotes: { releaseNotesUrl: `https://docs.liquit.com/docs/lws-release-notes-42#${version.split('.').slice(0, 3).join('')}` },
	};
});

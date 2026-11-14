import { defineShard } from 'anthelion';
import { compareVersions } from 'anthelion/helpers';
import ky from 'ky';

const docs = 'https://docs.knime.com/ap/latest';

const latest = (values: Iterable<string>) => [...new Set(values)].sort(compareVersions).at(-1);

// The download page renders its links client-side, so read the version from the
// official changelog: newest feature release first, then its newest bugfix entry.
export default defineShard(async () => {
	const guide = await ky(`${docs}/analytics_platform_installation_guide/index.html`).text();
	const branch = latest([...guide.matchAll(/\/ap\/latest\/changelogs\/(\d+\.\d+)"/g)].map((m) => m[1]!));
	if (!branch) throw new Error('No KNIME changelog link found');

	const changelog = await ky(`${docs}/changelogs/${branch}`).text();
	const version = latest(
		[...changelog.matchAll(/KNIME Analytics Platform (\d+\.\d+\.\d+)/g)]
			.map((m) => m[1]!)
			.filter((v) => v.startsWith(`${branch}.`)),
	);
	if (!version) throw new Error(`No KNIME ${branch}.x release in changelog`);

	return {
		version,
		urls: () => [
			`https://download.knime.org/analytics-platform/win/KNIME%20${version}%20Installer%20(64bit).exe`,
		],
	};
});

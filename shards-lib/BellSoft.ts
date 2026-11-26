import { defineShard } from 'anthelion';

type Release = { version: string; filename: string; featureVersion: number; interimVersion: number; updateVersion: number; patchVersion: number; extraVersion: number; buildVersion: number };

const architectures = { i586: 'x86', amd64: 'x64', aarch64: 'arm64' } as const;
const parts = (release: Release) => [release.featureVersion, release.interimVersion, release.updateVersion, release.patchVersion, release.extraVersion, release.buildVersion];
const newer = (a: Release, b: Release) => {
	const [x, y] = [parts(a), parts(b)];
	const index = x.findIndex((part, i) => part !== y[i]);
	return index !== -1 && x[index] > y[index];
};

// "latest" lists one release per update type (PSU 21.0.13.0.3+5, CSPU 21.0.13.1+5) in no fixed order, so take the highest.
export const liberica = (feature: number, bundle: string, { display = false, releaseNotes = false } = {}) =>
	defineShard(async () => {
		const releases: Release[] = await fetch(
			`https://api.bell-sw.com/v1/liberica/releases?version-feature=${feature}&version-modifier=latest&os=windows&package-type=msi&bundle-type=${bundle}`,
		).then((response) => response.json());
		const latest = releases.reduce((a, b) => (newer(b, a) ? b : a));
		const installers = Object.entries(architectures).flatMap(([name, architecture]) =>
			releases
				.filter((release) => release.version === latest.version && release.filename.includes(`-windows-${name}`))
				.map((release) => ({ url: `https://download.bell-sw.com/java/${release.version}/${release.filename}`, architecture })),
		);

		return {
			version: display ? { source: 'display' as const } : latest.version,
			urls: () => installers,
			...(releaseNotes && { releaseNotes: { releaseNotesUrl: `https://bell-sw.com/pages/liberica-release-notes-${latest.version.replace('+', '-')}/` } }),
		};
	});

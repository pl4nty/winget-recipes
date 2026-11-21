import { defineShard } from 'anthelion';
import { compareVersions } from 'anthelion/helpers';
import ky from 'ky';

// accellence publishes no version listing: installers sit at versioned paths on wg.accellence.eu
// (unknown files answer 500). Start from the newest version already in winget-pkgs and probe the
// next build, patch, minor and major numbers to find the newest installer that exists.
const installerUrl = (version: string) => {
	const [major, minor, patch] = version.split('.');
	return `https://wg.accellence.eu/vimacc/${major}_${minor}_${patch}/vimaccProfessional_${version}_x64_sign.exe`;
};

const exists = async (version: string) => {
	const response = await ky.head(installerUrl(version), {
		throwHttpErrors: false,
		timeout: 30_000,
		retry: 2,
	});
	return response.ok;
};

const latestKnownVersion = async () => {
	const token = process.env.GITHUB_TOKEN;
	const entries = await ky(
		'https://api.github.com/repos/microsoft/winget-pkgs/contents/manifests/a/accellence/vimaccProfessional',
		{
			headers: token ? { authorization: `Bearer ${token}` } : {},
			timeout: 30_000,
			retry: 3,
		},
	).json<{ name: string; type: string }[]>();
	const versions = entries
		.filter((entry) => entry.type === 'dir' && /^\d+(?:\.\d+){3}$/.test(entry.name))
		.map((entry) => entry.name)
		.sort(compareVersions);
	const version = versions.at(-1);
	if (!version) {
		throw new Error('No vimacc Professional version found in winget-pkgs');
	}
	return version;
};

const candidates = (version: string) => {
	const [major, minor, patch, build] = version.split('.').map(Number) as [
		number,
		number,
		number,
		number,
	];
	const next: string[] = [];
	for (let step = 1; step <= 5; step++) next.push(`${major}.${minor}.${patch}.${build + step}`);
	for (let step = 1; step <= 2; step++) {
		for (let b = 0; b <= 3; b++) next.push(`${major}.${minor}.${patch + step}.${b}`);
	}
	for (let b = 0; b <= 3; b++) next.push(`${major}.${minor + 1}.0.${b}`);
	for (let b = 0; b <= 3; b++) next.push(`${major + 1}.0.0.${b}`);
	return next;
};

export default defineShard(async () => {
	let version = await latestKnownVersion();
	for (;;) {
		let found: string | undefined;
		for (const candidate of candidates(version)) {
			if ((!found || compareVersions(candidate, found) > 0) && (await exists(candidate))) {
				found = candidate;
			}
		}
		if (!found || compareVersions(found, version) <= 0) break;
		version = found;
	}

	return {
		version,
		urls: () => [{ url: installerUrl(version), architecture: 'x64' }],
	};
});

import { defineShard } from 'anthelion';
import { compareVersions } from 'anthelion/helpers';

const installerUrl = (version: string) =>
	`https://d1.easeus.com/pctrans/free/pct${version}_free.exe`;

// EaseUS publishes no version anywhere: the download button serves a dated web
// stub, and only the full offline installer keeps a versioned URL that answers
// 403 until a build exists. Start from the newest version already in
// winget-pkgs and walk forward through the next patch, minor and major builds.
async function exists(version: string) {
	const response = await fetch(installerUrl(version), { method: 'HEAD' });
	return response.ok;
}

export default defineShard(async () => {
	const token = process.env.GITHUB_TOKEN;
	const entries: { name: string; type: string }[] = await fetch(
		'https://api.github.com/repos/microsoft/winget-pkgs/contents/manifests/e/EaseUS/TodoPCTrans',
		{ headers: token ? { Authorization: `Bearer ${token}` } : {} },
	).then((response) => {
		if (!response.ok) {
			throw new Error(`Failed to list winget-pkgs versions: ${response.status}`);
		}
		return response.json();
	});
	let version = entries
		.filter((entry) => entry.type === 'dir' && /^\d+\.\d+\.\d+$/.test(entry.name))
		.map((entry) => entry.name)
		.sort(compareVersions)
		.at(-1);
	if (!version) {
		throw new Error('No existing version found');
	}

	for (;;) {
		const [major, minor, patch] = version.split('.').map(Number) as [number, number, number];
		const candidates = [
			`${major}.${minor}.${patch + 1}`,
			`${major}.${minor}.${patch + 2}`,
			`${major}.${minor + 1}.0`,
			`${major + 1}.0.0`,
		];
		let next: string | undefined;
		for (const candidate of candidates) {
			if (await exists(candidate)) {
				next = candidate;
				break;
			}
		}
		if (!next) {
			break;
		}
		version = next;
	}

	return {
		version,
		urls: () => [installerUrl(version)],
	};
});

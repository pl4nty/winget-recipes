import { defineShard } from 'anthelion';
import { compareVersions } from 'anthelion/helpers';

// Maxon's downloads page only links the newest ZBrush line, so once a newer
// year ships it no longer lists 2026 builds. The installers stay on Maxon's
// package storage under versioned paths, so this probes the 2026.<minor>.<patch>
// grid there and takes the newest build that exists.
const line = '2026';
const base = 'https://mx-app-blob-prod.maxon.net/mx-package-production/installer';
const x64 = (version: string) =>
	`${base}/windows/maxon/zbrush/releases/${version}/Maxon_ZBrush_${version}_Installer_win_x86_64.exe`;
const arm64 = (version: string) =>
	`${base}/winarm/maxon/zbrush/releases/${version}/Maxon_ZBrush_${version}_Installer_win_arm64.exe`;

const exists = async (url: string) => {
	try {
		const response = await fetch(url, { method: 'HEAD' });
		return response.ok;
	} catch {
		return false;
	}
};

export default defineShard(async () => {
	const candidates: string[] = [];
	for (let minor = 0; minor <= 6; minor++) {
		for (let patch = 0; patch <= 9; patch++) candidates.push(`${line}.${minor}.${patch}`);
	}
	const found = (
		await Promise.all(candidates.map(async (version) => ((await exists(x64(version))) ? version : undefined)))
	).filter((version): version is string => version !== undefined);
	if (found.length === 0) throw new Error(`No ZBrush ${line} installer found`);
	const version = found.sort(compareVersions).at(-1)!;
	const urls = [x64(version)];
	if (await exists(arm64(version))) urls.push(arm64(version));

	return {
		version,
		urls: () => urls,
	};
});

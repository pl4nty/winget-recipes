import { defineShard } from 'anthelion';
import { compareVersions } from 'anthelion/helpers';

const base = 'https://developer.arm.com/-/media/Files/downloads/gnu';
const fileUrl = (release: string, file: string) =>
	`${base}/${release}/binrel/arm-gnu-toolchain-${release}-${file}`;

// developer.arm.com redirects requests for files a release does not ship to
// another file of that release (an .msi to the .zip), so a file only counts when
// the final URL still ends with the requested name. 15.x serves its MSI under the
// old .exe name too, so the MSI is tried first.
async function resolve(release: string, file: string) {
	const url = fileUrl(release, file);
	const response = await fetch(url, { method: 'HEAD' });
	if (!response.ok) {
		return undefined;
	}
	const finalName = new URL(response.url).pathname.split('/').at(-1)?.toLowerCase();
	return finalName === url.split('/').at(-1)!.toLowerCase() ? url : undefined;
}

async function exists(release: string) {
	const response = await fetch(fileUrl(release, 'mingw-w64-i686-arm-none-eabi.exe'), {
		method: 'HEAD',
	});
	return response.ok;
}

// The download page sits behind Akamai bot protection, so start from the newest
// release already in winget-pkgs and walk forward through the next releases.
export default defineShard(async () => {
	const token = process.env.GITHUB_TOKEN;
	const entries: { name: string; type: string }[] = await fetch(
		'https://api.github.com/repos/microsoft/winget-pkgs/contents/manifests/a/Arm/GnuArmEmbeddedToolchain',
		{ headers: token ? { Authorization: `Bearer ${token}` } : {} },
	).then((response) => {
		if (!response.ok) {
			throw new Error(`Failed to list winget-pkgs versions: ${response.status}`);
		}
		return response.json();
	});
	let release = entries
		.filter((entry) => entry.type === 'dir' && /^\d+\.\d+\.rel\d+$/i.test(entry.name))
		.map((entry) => entry.name.toLowerCase())
		.sort(compareVersions)
		.at(-1);
	if (!release) {
		throw new Error('No existing release found');
	}

	for (;;) {
		const [, major, minor, rel] = /^(\d+)\.(\d+)\.rel(\d+)$/.exec(release)!.map(Number) as [
			number,
			number,
			number,
			number,
		];
		const candidates = [
			`${major}.${minor}.rel${rel + 1}`,
			`${major}.${minor + 1}.rel1`,
			`${major + 1}.1.rel1`,
			`${major + 1}.2.rel1`,
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
		release = next;
	}

	const urls: { url: string; architecture: 'x86' | 'x64' }[] = [];
	for (const [arch, architecture] of [
		['i686', 'x86'],
		['x86_64', 'x64'],
	] as const) {
		for (const extension of ['msi', 'exe']) {
			const url = await resolve(release, `mingw-w64-${arch}-arm-none-eabi.${extension}`);
			if (url) {
				urls.push({ url, architecture });
				break;
			}
		}
	}

	return {
		version: release.replace('rel', 'Rel'),
		urls: () => urls,
	};
});

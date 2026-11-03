import { defineShard } from 'anthelion';
import { compareVersions } from 'anthelion/helpers';
import ky from 'ky';

// Windows builds sit in one directory per major (emacs-31/). Take the newest major, then its newest
// UCRT64 installer. Respins are published as emacs-{version}_N-installer-UCRT64.exe next to the
// original; the original file is used when it exists, as the manifests carry. ftp.gnu.org answers
// 403 to installer downloads from GitHub runners, so installers go through GNU's ftpmirror redirector.
const base = 'https://ftp.gnu.org/gnu/emacs/windows/';
const mirror = 'https://ftpmirror.gnu.org/emacs/windows/';

export default defineShard(async () => {
	const root = await ky(base, { timeout: 60_000 }).text();
	const major = [...root.matchAll(/href="emacs-(\d+)\/"/g)]
		.map(([, major]) => major!)
		.sort(compareVersions)
		.at(-1);
	if (!major) {
		throw new Error('No Emacs major directory found');
	}

	const dir = `${base}emacs-${major}/`;
	const listing = await ky(dir, { timeout: 60_000 }).text();
	const files = [
		...listing.matchAll(/href="(emacs-(\d+(?:\.\d+)+)(?:_\d+)?-installer-UCRT64\.exe)"/g),
	].map(([, file, version]) => ({ file: file!, version: version! }));
	const version = files
		.map((f) => f.version)
		.sort(compareVersions)
		.at(-1);
	if (!version) {
		throw new Error(`No UCRT64 installer found in emacs-${major}/`);
	}
	const original = `emacs-${version}-installer-UCRT64.exe`;
	const file = files.some((f) => f.file === original)
		? original
		: files
				.filter((f) => f.version === version)
				.map((f) => f.file)
				.sort()
				.at(-1)!;

	return {
		version,
		urls: () => [`${mirror}emacs-${major}/${file}`],
	};
});

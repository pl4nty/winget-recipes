import { defineShard } from 'anthelion';
import { compareVersions } from 'anthelion/helpers';

const base = 'https://cdn.kde.org/ci-builds/education/kstars/';

async function getText(url: string) {
	const response = await fetch(url);
	if (!response.ok) throw new Error(`${url} returned ${response.status}`);
	return response.text();
}

// KDE keeps one CI build per stable series (stable-X.Y.Z), so the newest series that has a Windows
// sideload package is found first. The package version is the AppX identity version, which komac reads.
export default defineShard(async () => {
	const series = [...(await getText(base)).matchAll(/href="stable-(\d+(?:\.\d+)+)\/"/gi)]
		.map(([, version]) => version as string)
		.toSorted((a, b) => compareVersions(b, a));

	for (const name of series) {
		const dir = `${base}stable-${name}/windows/`;
		const response = await fetch(dir);
		if (!response.ok) continue;
		const file = [
			...(await response.text()).matchAll(
				/href="(kstars-stable-\d+(?:\.\d+)+-\d+-windows-cl-msvc2022-x86_64-sideload\.appx)"/gi,
			),
		].at(-1)?.[1];
		if (!file) continue;

		return {
			version: { source: 'product' },
			urls: () => [`${dir}${file}`],
			state: file,
		};
	}
	throw new Error('no stable Windows sideload package found');
});

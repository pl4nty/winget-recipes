import { defineShard } from 'anthelion';
import { compareVersions } from 'anthelion/helpers';

export default defineShard(async () => {
	const listing = await fetch('https://xpra.org/stable/windows/').then((response) => response.text());
	const latest = [...listing.matchAll(/Xpra-x86_64_Setup_(\d+(?:\.\d+)+)-r(\d+)\.exe"/g)]
		.map((m) => ({ version: m[1]!, revision: m[2]! }))
		.sort((a, b) => compareVersions(`${a.version}.${a.revision}`, `${b.version}.${b.revision}`))
		.at(-1);
	if (!latest) throw new Error('No Xpra x86_64 setup found in the stable listing');

	return {
		version: latest.version,
		urls: () => [`https://xpra.org/stable/windows/Xpra-x86_64_Setup_${latest.version}-r${latest.revision}.exe`],
		releaseNotes: { releaseNotesUrl: `https://github.com/Xpra-org/xpra/releases/tag/v${latest.version}` },
	};
});

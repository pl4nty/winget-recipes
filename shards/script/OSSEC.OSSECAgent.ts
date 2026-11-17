import { defineShard } from 'anthelion';

// The channel keeps every build; the build number increases across versions, so the greatest build is the latest.
export default defineShard(async () => {
	const base = 'https://updates.atomicorp.com/channels/atomic/windows/';
	const listing = await fetch(base).then((response) => response.text());
	const builds = [...listing.matchAll(/ossec-agent-win32-(\d+(?:\.\d+)+)-(\d+)\.exe/gi)].map(([, version, build]) => ({
		version: version!,
		build: Number(build),
	}));
	const latest = builds.sort((a, b) => a.build - b.build).at(-1);
	if (!latest) throw new Error('No OSSEC agent installer found in channel listing');

	return {
		version: latest.version,
		urls: () => [`${base}ossec-agent-win32-${latest.version}-${latest.build}.exe`],
	};
});

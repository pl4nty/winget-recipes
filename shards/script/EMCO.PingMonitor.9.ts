import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';

// The download page can lag behind the builds EMCO publishes in its versioned archive (page 9.3.1, archive 9.3.2),
// so probe the archive for patch/minor releases newer than the page version and take the highest one that exists.
// Architecture: the payload is AnyCPU .NET (Ping Monitor.exe ILONLY, no 32BITREQUIRED) with x86 and x64 drivers, so neutral.
const archive = (version: string) => `https://storage.emcosoftware.com/download/archive/pingmonitor/v9/PingMonitorSetup-${version}.exe`;
const exists = async (url: string) => (await fetch(url, { method: 'HEAD' })).ok;

export default defineShard(async () => {
	const page = await fetch('https://emcosoftware.com/ping-monitor/download').then((response) => response.text());
	const {
		captures: { version: listed },
	} = match(page, /Version (?<version>9\.\d+(?:\.\d+)*)/, 'No Ping Monitor 9 version on the download page');
	const [major, minor = 0, patch = 0] = listed.split('.').map(Number) as [number, number?, number?];

	// Highest first: next minor, then the next five patch releases.
	const candidates = [
		`${major}.${minor + 1}.0`,
		`${major}.${minor + 1}`,
		...Array.from({ length: 5 }, (_, i) => `${major}.${minor}.${patch + 5 - i}`),
	];
	let version = listed;
	let url = 'https://storage.emcosoftware.com/download/pingmonitor/PingMonitorSetup.exe';
	for (const candidate of candidates)
		if (await exists(archive(candidate))) {
			version = candidate;
			url = archive(candidate);
			break;
		}

	return {
		version,
		urls: () => [{ url, architecture: 'neutral' as const }],
		releaseNotes: { releaseNotesUrl: 'https://emcosoftware.com/ping-monitor/whats-new/9' },
	};
});

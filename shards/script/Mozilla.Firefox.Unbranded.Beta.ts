import { defineShard } from 'anthelion';

// Unbranded (add-on-devel) beta builds are only published as Taskcluster artifacts of the latest mozilla-beta build.
const API = 'https://firefox-ci-tc.services.mozilla.com/api';

async function build(platform: string) {
	const { taskId } = (await fetch(`${API}/index/v1/task/gecko.v2.mozilla-beta.latest.firefox.${platform}`).then((response) =>
		response.json(),
	)) as { taskId: string };
	const { status } = (await fetch(`${API}/queue/v1/task/${taskId}/status`).then((response) => response.json())) as {
		status: { runs: { runId: number; state: string }[] };
	};
	const run = status.runs.findLast((r) => r.state === 'completed');
	if (!run) throw new Error(`No completed run for ${platform} task ${taskId}`);
	const artifacts = `${API}/queue/v1/task/${taskId}/runs/${run.runId}/artifacts/public/build`;
	const buildhub = (await fetch(`${artifacts}/buildhub.json`).then((response) => response.json())) as {
		target: { version: string };
	};
	return { version: buildhub.target.version, url: `${artifacts}/target.zip` };
}

export default defineShard(async () => {
	const [x64, x86] = await Promise.all([build('win64-add-on-devel'), build('win32-add-on-devel')]);
	if (x64.version !== x86.version) throw new Error(`Unbranded beta builds differ: x64 ${x64.version}, x86 ${x86.version}`);
	if (!/^\d+\.\d+b\d+$/.test(x64.version)) throw new Error(`Unexpected unbranded beta version ${x64.version}`);

	return {
		version: x64.version,
		urls: () => [
			{ url: x64.url, architecture: 'x64' as const },
			{ url: x86.url, architecture: 'x86' as const },
		],
		releaseNotes: { releaseNotesUrl: `https://www.mozilla.org/firefox/${x64.version.replace(/b\d+$/, '')}beta/releasenotes/` },
	};
});

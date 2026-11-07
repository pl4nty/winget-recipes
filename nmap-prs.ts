import { $ } from 'bun';

// `bun nmap-prs.ts [--post]` lists open winget-pkgs PRs that add Insecure.Nmap 7.90 or later, which can't install
// silently. Prints `<PR>\t<version>\t<commented|missing|posted>`; --post leaves the review comment where it's missing.
const post = process.argv.includes('--post');
const repo = 'microsoft/winget-pkgs';
const issue = '#341747';
const comment = `Thanks for your submission! Unfortunately new versions of this app don't support silent install, and can't be added. See ${issue}`;

const unsupported = (version: string) => {
	const [major = 0, minor = 0] = version.split('.').map(Number);
	return major > 7 || (major === 7 && minor >= 90);
};

const { items }: { items: { number: number }[] } =
	await $`gh api -X GET search/issues -f q=${`repo:${repo} is:pr is:open Insecure.Nmap`} -f per_page=100`.json();
for (const { number } of items) {
	const files: { filename: string }[] = await $`gh api ${`repos/${repo}/pulls/${number}/files?per_page=100`}`.json();
	const versions = files
		.map(({ filename }) => filename.match(/^manifests\/i\/Insecure\/Nmap\/([^/]+)\//)?.[1])
		.filter((version): version is string => !!version && unsupported(version));
	if (!versions.length) continue;

	const bodies: { body: string | null }[] = [
		...(await $`gh api ${`repos/${repo}/pulls/${number}/reviews?per_page=100`}`.json()),
		...(await $`gh api ${`repos/${repo}/issues/${number}/comments?per_page=100`}`.json()),
	];
	let status = bodies.some(({ body }) => body?.includes(issue)) ? 'commented' : 'missing';
	if (status === 'missing' && post) {
		await $`gh api ${`repos/${repo}/pulls/${number}/reviews`} -f event=COMMENT -f body=${comment}`.quiet();
		status = 'posted';
	}
	console.log(`${number}\t${[...new Set(versions)].join(' ')}\t${status}`);
}

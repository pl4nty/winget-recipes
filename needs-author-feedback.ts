import { mkdir, writeFile } from 'node:fs/promises';

import { $ } from 'bun';

const author = process.argv[2] ?? 'pl4nty';
const out = 'needs-author-feedback';

type Pr = { number: number; title: string; labels: { name: string }[] };
const { items }: { items: Pr[] } =
	await $`gh api -X GET search/issues -f q=${`repo:microsoft/winget-pkgs is:pr is:open author:${author} label:Needs-Author-Feedback`} -f per_page=100`.json();
for (const pr of items.slice(0, 12)) {
	const dir = `${out}/${pr.number}`;
	await mkdir(dir, { recursive: true });
	const pull = await $`gh api repos/microsoft/winget-pkgs/pulls/${pr.number}`.json();
	const sha = pull.head.sha;
	const checks = await $`gh api --paginate --slurp repos/microsoft/winget-pkgs/commits/${sha}/check-runs`.json();
	const statuses = await $`gh api --paginate --slurp repos/microsoft/winget-pkgs/commits/${sha}/statuses`.json();
	await writeFile(`${dir}/checks.json`, JSON.stringify({ pull, checks, statuses }, null, '\t'));
	const urls = new Set(JSON.stringify({ checks, statuses }).match(/https?:\/\/[^\s)\]"\\<>]+/g) ?? []);
	await writeFile(`${dir}/urls.txt`, [...urls].join('\n'));
	let i = 0;
	for (const url of urls) {
		if (!/\.zip\b/i.test(url)) continue;
		i++;
		await $`curl -fsSL --max-time 120 -o ${dir}/${i}.zip ${url}`.nothrow();
		await $`unzip -oq ${dir}/${i}.zip -d ${dir}/${i}`.nothrow();
	}
}

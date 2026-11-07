import { mkdir, writeFile } from 'node:fs/promises';

import { $ } from 'bun';

const author = process.argv[2] ?? 'pl4nty';
const out = 'needs-author-feedback';

type Pr = { number: number; title: string; labels: { name: string }[] };
const { items }: { items: Pr[] } =
	await $`gh api -X GET search/issues -f q=${`repo:microsoft/winget-pkgs is:pr is:open author:${author} label:Needs-Author-Feedback`} -f per_page=100`.json();
for (const pr of items) {
	const dir = `${out}/${pr.number}`;
	await mkdir(dir, { recursive: true });
	const comments = await $`gh api --paginate --slurp repos/microsoft/winget-pkgs/issues/${pr.number}/comments`.json();
	await writeFile(`${dir}/comments.json`, JSON.stringify({ pr, comments: comments.flat() }, null, '\t'));
	const urls = new Set(JSON.stringify(comments).match(/https?:\/\/[^\s)\]"\\<>]+/g) ?? []);
	await writeFile(`${dir}/urls.txt`, [...urls].join('\n'));
	let i = 0;
	for (const url of urls) {
		if (!/\.zip\b|ValidationResult|blob\.core|_apis\/build/i.test(url)) continue;
		i++;
		await $`curl -fsSL --max-time 120 -o ${dir}/${i}.zip ${url}`.nothrow();
		await $`unzip -oq ${dir}/${i}.zip -d ${dir}/${i}`.nothrow();
	}
}

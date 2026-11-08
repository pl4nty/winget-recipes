import { readFile, writeFile } from 'node:fs/promises';

import { $ } from 'bun';

const numbers = (await readFile('dupe-prs.txt', 'utf8')).trim().split('\n').map(Number);
const fields = `number title state createdAt body headRefName headRefOid author { login } labels(first: 30) { nodes { name } }
	comments(first: 100) { nodes { author { login } createdAt body } }
	reviews(first: 50) { nodes { author { login } state createdAt body } }
	files(first: 20) { nodes { path } }`;
const prs: any[] = [];
const query = `{ repository(owner: "microsoft", name: "winget-pkgs") { ${numbers.map((n) => `p${n}: pullRequest(number: ${n}) { ${fields} }`).join(' ')} } }`;
const { data } = (await $`gh api graphql -f query=${query}`.quiet()).json();
prs.push(...Object.values(data.repository));
const refs = new Set<number>();
for (const pr of prs) {
	for (const c of pr.comments.nodes) for (const m of c.body.matchAll(/#(\d{5,6})/g)) refs.add(Number(m[1]));
	pr.contents = {};
	for (const { path } of pr.files.nodes) {
		const r = await $`gh api -H ${'Accept: application/vnd.github.raw'} ${`repos/microsoft/winget-pkgs/contents/${path}?ref=${pr.headRefOid}`}`.nothrow().quiet();
		pr.contents[path] = r.stdout.toString();
	}
}
const others: any[] = [];
const list = [...refs].filter((n) => !numbers.includes(n));
for (let i = 0; i < list.length; i += 20) {
	const q = `{ repository(owner: "microsoft", name: "winget-pkgs") { ${list.slice(i, i + 20).map((n) => `p${n}: issueOrPullRequest(number: ${n}) { ... on PullRequest { number title state createdAt mergedAt author { login } files(first: 20) { nodes { path } } } ... on Issue { number title state } }`).join(' ')} } }`;
	const r = await $`gh api graphql -f query=${q}`.nothrow().quiet();
	if (r.exitCode === 0) others.push(...Object.values(r.json().data.repository));
	else console.error(r.stderr.toString());
}
await writeFile('dupe-comments.json', JSON.stringify({ prs, others }));

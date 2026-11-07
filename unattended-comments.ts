import { readFile, writeFile } from 'node:fs/promises';

import { $ } from 'bun';

const numbers = (await readFile('unattended-prs.txt', 'utf8')).trim().split('\n').map(Number);
const fields = `number title state createdAt mergedAt author { login } labels(first: 30) { nodes { name } }
	comments(first: 100) { nodes { author { login } createdAt body } }
	reviews(first: 50) { nodes { author { login } state createdAt body } }`;
const prs: unknown[] = [];
for (let i = 0; i < numbers.length; i += 20) {
	const batch = numbers.slice(i, i + 20);
	const query = `{ repository(owner: "microsoft", name: "winget-pkgs") { ${batch.map((n) => `p${n}: pullRequest(number: ${n}) { ${fields} }`).join(' ')} } rateLimit { remaining resetAt } }`;
	for (let attempt = 0; ; attempt++) {
		const result = await $`gh api graphql -f query=${query}`.nothrow().quiet();
		if (result.exitCode === 0) {
			const { data } = result.json();
			prs.push(...Object.values(data.repository).filter(Boolean));
			console.log(`${prs.length}/${numbers.length} remaining ${data.rateLimit.remaining}`);
			break;
		}
		console.error(result.stderr.toString());
		if (attempt === 5) throw new Error(`batch ${i} failed`);
		await Bun.sleep(60_000);
	}
}
await writeFile('unattended-comments.json', JSON.stringify(prs));

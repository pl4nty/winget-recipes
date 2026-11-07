import { $ } from 'bun';
for (const path of ['issues/471379/comments', 'issues/471379/timeline', 'pulls/471379/reviews', 'pulls/471379/comments']) {
	console.log(`## ${path}`);
	const items = await $`gh api --paginate --slurp repos/microsoft/winget-pkgs/${path}`.json();
	for (const i of items.flat()) console.log(`- ${i.created_at ?? i.submitted_at} ${i.user?.login ?? i.actor?.login} ${i.event ?? ''} ${i.label?.name ?? ''} ${(i.body ?? '').slice(0, 3000)}`);
}

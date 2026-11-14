import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';

// Builds come from the vendor's GitLab project (morpheusly-labs/morpheusly-client),
// tagged like 20260711-1722, but only some tags get a Windows agent. Take the
// newest tag whose Windows download exists. Upstream writes the version as
// 20260711.1722-1, which is also the download path segment.
export default defineShard(async () => {
	const response = await fetch(
		'https://gitlab.com/api/v4/projects/62857508/repository/tags?per_page=100&order_by=updated&sort=desc',
	);
	if (!response.ok) throw new Error(`Failed to list morpheusly-client tags: ${response.status}`);
	const tags = (await response.json()) as { name: string }[];

	for (const { name } of tags) {
		if (!/^\d{8}-\d{4}$/.test(name)) continue;
		const {
			captures: { date, time },
		} = match(name, /^(?<date>\d{8})-(?<time>\d{4})$/);
		const version = `${date}.${time}-1`;
		const url = `https://app.morpheusly.com/agents/download/windows${version}/morpheusly-windows-agent.exe`;
		const head = await fetch(url, { method: 'HEAD' });
		if (!head.ok) continue;
		return {
			version,
			urls: () => [
				{ url, architecture: 'x64' },
				{ url, architecture: 'arm64' },
			],
		};
	}
	throw new Error('No morpheusly-client tag has a Windows agent download');
});

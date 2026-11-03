import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';

type Release = {
	tag_name: string;
	draft: boolean;
	assets: { name: string }[];
};

// Playtests are tagged playtest-YYYYMMDD; winget versions them as YYYY.MM.DD.
export default defineShard(async () => {
	const response = await fetch('https://api.github.com/repos/OpenRA/OpenRA/releases?per_page=30', {
		headers: {
			Accept: 'application/vnd.github+json',
			...(process.env.GITHUB_TOKEN && { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` }),
		},
	});
	if (!response.ok) throw new Error(`Failed to list OpenRA releases: ${response.status}`);

	const releases = (await response.json()) as Release[];
	const release = releases.find((r) => !r.draft && /^playtest-\d{8}$/.test(r.tag_name));
	if (!release) throw new Error('No OpenRA playtest release found');

	const tag = release.tag_name;
	const [year, month, day] = match(tag, /^playtest-(\d{4})(\d{2})(\d{2})$/).groups;
	const date = `${year}${month}${day}`;

	return {
		version: `${year}.${month}.${day}`,
		urls: () => [
			`https://github.com/OpenRA/OpenRA/releases/download/${tag}/OpenRA-playtest-${date}-x64.exe`,
			`https://github.com/OpenRA/OpenRA/releases/download/${tag}/OpenRA-playtest-${date}-arm64.exe`,
		],
		releaseNotes: { releaseNotesUrl: `https://github.com/OpenRA/OpenRA/releases/tag/${tag}` },
	};
});

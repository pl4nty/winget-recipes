import { defineShard } from 'anthelion';
import { latestUpstreamVersion } from '../lib/winget.ts';

type Update = { CurrentVersionNumber?: string; FileURL: string };

export default defineShard(async () => {
	const current = await latestUpstreamVersion('WonderIdea.Animiz');
	const [x86, x64] = await Promise.all(
		['32', '64'].map((digit) =>
			fetch(`https://animiz.com/update/animiz-update-info.php?${new URLSearchParams({ version: current, os: 'Windows 10', digit })}`).then((response) => response.json() as Promise<Update>),
		),
	);
	if (!x64!.CurrentVersionNumber) throw new Error(`No update after ${current}`);
	if (x86!.CurrentVersionNumber !== x64!.CurrentVersionNumber) throw new Error('Inconsistent versions detected');
	const path = (url: string) => {
		const parsed = new URL(url);
		parsed.protocol = 'https:';
		parsed.search = '';
		return parsed.href;
	};
	return { version: x64!.CurrentVersionNumber, urls: () => [path(x86!.FileURL), path(x64!.FileURL)] };
});

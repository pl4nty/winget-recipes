import { $ } from 'bun';

// `bun silent-install-prs.ts [--post]` lists open winget-pkgs PRs for packages that can't install silently. Prints
// `<PR>\t<id> <version>\t<commented|missing|posted>`; --post leaves the review comment where it's missing.
const post = process.argv.includes('--post');
const repo = 'microsoft/winget-pkgs';
const packages: { ids: string[]; from?: string; see: string }[] = [
	{ ids: ['Insecure.Nmap'], from: '7.90', see: '#341747' },
	{ ids: ['Insecure.Npcap', 'Npcap.Npcap', 'Nmap.Npcap', 'nmap.nmapnpcap', 'GordonLyon.Npcap'], see: '#361415' },
	{ ids: ['Zenju.FreeFileSync', 'FreeFileSync.FreeFileSync', 'FreeFileSync.org.FreeFileSync'], see: '#57900' },
	{ ids: ['BetterDiscord.BetterDiscord'], see: '#100686' },
	{ ids: ['RobloxCorporation.RobloxBootstrapper'], see: '#101346' },
	{ ids: ['Jigsaw.Outline', 'Jigsaw.OutlineClient'], see: '#346291' },
	{ ids: ['Adobe.AdobeDigitalEditions'], see: '#36002' },
	{ ids: ['ArtifexSoftware.Ghostscript'], from: '10.01.0', see: '#267547' },
	{ ids: ['Fortinet.FortiClientVPN', 'FortinetInc.FortiClientVPNOnlineInstallation'], see: '#251757' },
	{ ids: ['FlexRadioSystems.SmartSDR'], see: '#115470' },
	{ ids: ['LizardByte.libvirtualhid'], see: '#420227' },
	{ ids: ['jthedering.EqualizerAPO', 'EqualizerAPO.EqualizerAPO', 'Equalizer.APO', 'EqualizerAPO.APO64'], see: '#9186' },
];

const atLeast = (version: string, from: string) => {
	const [a, b] = [version, from].map((v) => v.split('.').map((part) => parseInt(part) || 0));
	for (let i = 0; i < Math.max(a!.length, b!.length); i++)
		if ((a![i] ?? 0) !== (b![i] ?? 0)) return (a![i] ?? 0) > (b![i] ?? 0);
	return true;
};

for (const { ids, from, see } of packages) {
	const comment = `Thanks for your submission! Unfortunately new versions of this app don't support silent install, and can't be added. See ${see}`;
	const numbers = new Set<number>();
	for (const id of ids) {
		const { items }: { items: { number: number }[] } =
			await $`gh api -X GET search/issues -f q=${`repo:${repo} is:pr is:open ${id}`} -f per_page=100`.json();
		for (const { number } of items) numbers.add(number);
		await Bun.sleep(2100); // 30 searches per minute
	}
	for (const number of numbers) {
		const files: { filename: string }[] = await $`gh api ${`repos/${repo}/pulls/${number}/files?per_page=100`}`.json();
		const matches = files
			.map(({ filename }) => filename.split('/').slice(2, -1))
			.filter((path) => path.length > 2)
			.map((path) => ({ id: path.slice(0, -1).join('.'), version: path.at(-1)! }))
			.filter(({ id, version }) => ids.some((i) => i.toLowerCase() === id.toLowerCase()) && (!from || atLeast(version, from)))
			.map(({ id, version }) => `${id} ${version}`);
		if (!matches.length) continue;

		const bodies: { body: string | null }[] = [
			...(await $`gh api ${`repos/${repo}/pulls/${number}/reviews?per_page=100`}`.json()),
			...(await $`gh api ${`repos/${repo}/issues/${number}/comments?per_page=100`}`.json()),
		];
		let status = bodies.some(({ body }) => body?.includes(see)) ? 'commented' : 'missing';
		if (status === 'missing' && post) {
			await $`gh api ${`repos/${repo}/pulls/${number}/reviews`} -f event=COMMENT -f body=${comment}`.quiet();
			status = 'posted';
		}
		console.log(`${number}\t${[...new Set(matches)].join(' ')}\t${status}`);
	}
}

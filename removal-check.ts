import { $ } from 'bun';
const gh = (path: string) => $`gh api ${path}`.nothrow().quiet().then((r) => (r.exitCode ? null : r.json()));
const repos: [string, string, string[]][] = [
	['imonoonoko/Bit-TTT-Engine', 'v1.0.0', ['BitLlama-Desktop-Setup.exe']],
	['Hermithic/aiask', 'v2.0.1', ['aiask-2.0.1-windows-amd64.zip']],
	['naplon74/flowify-music-player', 'v0.0.5', ['Flowify-Setup-0.0.5.exe']],
	['Ramazanenescik04/Capsule-Launcher', '0.3.0', ['CapsuleSetup.exe']],
	['digitalghost-dev/poke-cli', 'v1.9.0', ['poke-cli_Windows_x86_64.zip']],
	['Abdozebzeb/Past-Paper-Manager', 'V1.0.4', ['pastpaper_manager_installer_v1.0.4_signed.exe']],
	['mrenanpx/appyama-novo', 'v.1.1.1', ['YAMA-v.1.11_x64-setup.exe']],
	['AariyJP/VRCXF', '', ['VRCXF_Setup_x64.exe']],
	['AariyJP/ai-switcher', '', ['AI.Switcher_x64-setup.exe']],
	['microsoft/MIDI', 'rc-1', ['Windows.MIDI.Services.SDK.Runtime.and.Tools.1.0.14-rc.1.209-x64.exe']],
	['microsoft/MIDI', 'rc-3', ['Windows.MIDI.Services.SDK.Runtime.and.Tools.1.0.16-rc.3.7-x64.exe']],
	['microsoft/MIDI', 'enablement-checker', ['midicheckservice_x64.zip']],
	['Azure/Azure-Media-Services-Explorer', 'v5.8.3.0', ['AMSExplorerSetup_v5.8.3.msi']],
	['microsoft/shell-use', 'v0.0.1-beta.6', ['shell-use-x86_64-pc-windows-msvc.zip']],
	['nostar/DroidStar', '', ['DroidStar-1faf794-md380emu-win-x64.exe']],
];
for (const [repo, tag, files] of repos) {
	const info = await gh(`repos/${repo}`);
	console.log(`## ${repo}: ${info ? `exists as ${info.full_name} archived=${info.archived}` : 'repo not found'}`);
	if (!info) {
		const owner = await gh(`users/${repo.split('/')[0]}`);
		console.log(`owner: ${owner ? `${owner.login} repos=${owner.public_repos}` : 'not found'}`);
		continue;
	}
	const releases = (await gh(`repos/${info.full_name}/releases?per_page=100`)) ?? [];
	const hit = releases.find((r: any) => r.tag_name === tag);
	console.log(`tag ${tag}: ${hit ? 'release exists, assets: ' + hit.assets.map((a: any) => a.name).join(' ') : 'no release'}`);
	for (const r of releases.slice(0, 3)) console.log(`latest: ${r.tag_name} ${r.published_at} ${r.assets.map((a: any) => a.name).join(' ')}`);
	const names = releases.flatMap((r: any) => r.assets.map((a: any) => `${r.tag_name}/${a.name}`)).filter((n: string) => files.some((f) => n.endsWith(f)));
	console.log(`same file elsewhere: ${names.join(' ') || 'none'}`);
}
for (const url of [
	'https://qi.163.com/download',
	'https://app.evope.com.br/',
	'https://www.evope.com.br/',
	'http://pizzanbeer.net/droidstar/',
	'https://virt-manager.org/download',
	'https://gitlab.com/api/v4/projects/virt-viewer%2Fvirt-viewer/releases',
	'https://www.microsoft.com/en-us/download/details.aspx?id=15011',
	'https://dl.min.io/server/minio/release/windows-amd64/',
	'https://docs.poke-cli.com/',
]) {
	const r = await fetch(url, { signal: AbortSignal.timeout(30_000) }).catch((e) => null);
	const body = r ? await r.text() : '';
	const links = [...new Set(body.match(/https?:\/\/[^"'\s<>]+\.(?:exe|msi|zip)\b|href="[^"]+\.(?:exe|msi|zip)"/gi) ?? [])].slice(0, 15);
	console.log(`## ${url}: ${r?.status ?? 'error'} ${links.join(' ')}`);
	if (url.includes('poke-cli') || url.includes('min.io')) console.log(body.match(/github\.com\/[\w-]+\/[\w-]+/g)?.slice(0, 5).join(' '), body.slice(0, 300).replace(/\s+/g, ' '));
}

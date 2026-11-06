import { defineShard } from 'anthelion';
import { githubClient } from 'anthelion/github';

const repos: Record<string, string[]> = {"AbdullahZeb.PastPaperManager": ["Abdozebzeb/Past-Paper-Manager"], "Abelfubu.WindowsConfigBuilder": ["abelfubu/windows-config-builder"], "AdoptOpenJDK.OpenJDK.16.OpenJ9": ["AdoptOpenJDK/openjdk16-binaries"], "AndrewCalcutt.Vistumbler": ["RIEI/Vistumbler", "acalcutt/Vistumbler"], "AnInsomniacy.MotrixNext": ["AnInsomniacy/motrix-next"], "Audio_Arcade.Audio_Arcade": ["Audio-Arcade/Audio_Arcade"], "Authpass.Authpass": ["authpass/authpass"], "BepassOrg.OblivionDesktop": ["bepass-org/oblivion-desktop"], "bronya0.Kafka-King": ["Bronya0/Kafka-King"], "BtbN.FFmpeg.GPL.Shared": ["BtbN/FFmpeg-Builds"], "CakeWallet.CakeWallet": ["cake-tech/cake_wallet"], "cangzhang.champ-r": ["cangzhang/champ-r"], "Cemu.Cemu.Experimental": ["cemu-project/Cemu"], "Corona.Solar2D": ["coronalabs/corona"], "DevToys-app.DevToys": ["DevToys-app/DevToys"], "digitalghost-dev.poke-cli": ["digitalghost-dev/poke-cli"], "DimitarRadenkov.SnippingTool": ["dimitar-radenkov/SnippingTool"], "EclipseCommunity.r3dfox": ["Eclipse-Community/r3dfox"], "ElijahLopez.MusicCaster": ["elibroftw/music-caster"], "EmirE.Capsule": ["Ramazanenescik04/Capsule-Launcher"], "fire-eggs.DarkThumbs": ["fire-eggs/DarkThumbs"], "Flowify.Flowify": ["naplon74/flowify-music-player"], "FrostWire.FrostWire": ["frostwire/frostwire"], "gileli121.windowtop": ["WindowTop/WindowTop-App"], "GPBeta.SAOUtils.Exp": ["NERvGear/SAO-Utils"], "Hermithic.aiask": ["Hermithic/aiask"], "imonoonoko.BitLlamaDesktop": ["imonoonoko/Bit-TTT-Engine"], "intxcc.pyaudio": ["intxcc/pyaudio_portaudio"], "ktsu.BlastMerge": ["ktsu-dev/BlastMerge"], "kvakulo.switcheroo": ["kvakulo/Switcheroo"], "marchellodev.Sharik": ["marchellodev/sharik"], "navossoc.MenuTools": ["navossoc/MenuTools"], "OpenBB-finance.OpenBBTerminal": ["OpenBB-finance/OpenBBTerminal"], "PolarGoose.minisat": ["PolarGoose/minisat-for-Windows"], "RandyRants.SharpKeys": ["randyrants/sharpkeys"], "sacd-ripper.sacd-ripper": ["sacd-ripper/sacd-ripper"], "SpencerSoft.Chess": ["spencerparkin/ChessEngine"], "TheOneCodes.Wii-Balance-Board-GUI": ["TheOneCodes/Wii-Balance-Board-GUI"], "weolar.xpchrome": ["weolar/xpchrome"], "Wfrog.Wfrog.SVN": ["wfrog/wfrog"], "WorldTimeCLI.WorldTimeCLI": ["Nurbek1998/WorldTimeCLI"], "GianlucaPernigotto.Videomass": ["jeanslack/Videomass"], "JasonSandys.UI++": ["jason4tw/UIPlusPlus"]};

export default defineShard(async () => {
	await Promise.all(
		Object.entries(repos).flatMap(([id, list]) =>
			list.map(async (full) => {
				const [owner, repo] = full.split('/');
				let out: unknown;
				try {
					const { data: r } = await githubClient.rest.repos.get({ owner, repo });
					const { data: rel } = await githubClient.rest.repos.listReleases({ owner, repo, per_page: 10 });
					const pub = rel.filter((x) => !x.draft);
					const stable = pub.find((x) => !x.prerelease);
					out = { full: r.full_name, archived: r.archived, pushed: r.pushed_at, latest: pub[0] && [pub[0].tag_name, pub[0].published_at, pub[0].prerelease], stable: stable && [stable.tag_name, stable.published_at] };
				} catch (error) {
					out = String(error).slice(0, 80);
				}
				console.log('PROBE ' + id + ' ' + full + ' ' + JSON.stringify(out));
			}),
		),
	);
	throw new Error('probe only');
});

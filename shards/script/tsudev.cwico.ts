import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';

// The release tag (tsudev-cwico-v26.8.19) and the app version in the asset names
// (26.8.1901) differ, so the version comes from the Tauri updater feed and the
// tag from the latest-release redirect.
export default defineShard(async () => {
	const repo = 'https://github.com/tsudev-tsudev/tsudev-cwico';
	const feed = (await fetch(`${repo}/releases/latest/download/latest.json`).then((response) => response.json())) as {
		version: string;
	};
	const response = await fetch(`${repo}/releases/latest`, { method: 'HEAD', redirect: 'manual' });
	const {
		captures: { tag },
	} = match(response.headers.get('location'), /\/releases\/tag\/(?<tag>[^/?#]+)$/);
	const version = feed.version;

	return {
		version,
		urls: () => [
			`${repo}/releases/download/${tag}/tsudev-cwico_${version}_x64_en-US.msi`,
			`${repo}/releases/download/${tag}/tsudev-cwico_${version}_x64-setup.exe`,
		],
		releaseNotes: {
			source: 'github',
			owner: 'tsudev-tsudev',
			repo: 'tsudev-cwico',
			tag,
		},
	};
});

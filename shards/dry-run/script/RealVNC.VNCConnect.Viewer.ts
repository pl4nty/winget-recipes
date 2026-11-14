import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';
import { text } from '../lib/fetch.ts';

type Config = { index: { products: Record<string, { platforms: { windows: { latest_version: string; files: { arch: string; pkg: string; filename?: string; file?: string }[] } } }> } };

export default defineShard(async () => {
	const html = await text('https://www.realvnc.com/en/connect/download/viewer/');
	const config = JSON.parse(match(html, /<script[^>]*class="rvnc-mass-config"[^>]*>([\s\S]*?)<\/script>/).groups[0]) as Config;
	const { latest_version: version, files } = config.index.products['realvnc-connect-viewer']!.platforms.windows;
	const file = files.find(({ arch, pkg }) => arch === 'x64' && /msi/i.test(pkg));
	if (!file) throw new Error('No x64 MSI package');
	return {
		version,
		urls: () => [{ url: new URL(file.filename ?? file.file!, 'https://downloads.realvnc.com/download/file/realvnc-connect-viewer/').href, nestedInstallerMatches: [`RealVNC-Connect-Viewer-${version}-Windows.msi`] }],
	};
});

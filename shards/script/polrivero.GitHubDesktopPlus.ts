import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';

// Tags are v<major>.<minor>.<patch>.<revision>, but upstream PackageVersion is <major>.<minor>.<patch>-r<revision>.
export default defineShard(async () => {
	const response = await fetch('https://github.com/desktop-plus/desktop-plus/releases/latest', { method: 'HEAD', redirect: 'manual' });
	const location = response.headers.get('location') ?? '';
	const {
		captures: { tag, base, revision },
	} = match(location, /\/releases\/tag\/(?<tag>v(?<base>\d+\.\d+\.\d+)\.(?<revision>\d+))$/, 'No stable Desktop Plus release found');

	return {
		version: `${base}-r${revision}`,
		urls: () => [
			`https://github.com/desktop-plus/desktop-plus/releases/download/${tag}/DesktopPlus-${tag}-windows-x64.exe`,
			`https://github.com/desktop-plus/desktop-plus/releases/download/${tag}/DesktopPlus-${tag}-windows-arm64.exe`,
			`https://github.com/desktop-plus/desktop-plus/releases/download/${tag}/DesktopPlus-${tag}-windows-x64.msi`,
			`https://github.com/desktop-plus/desktop-plus/releases/download/${tag}/DesktopPlus-${tag}-windows-arm64.msi`,
		],
		releaseNotes: { source: 'github', owner: 'desktop-plus', repo: 'desktop-plus', tag, cleanup: false },
	};
});

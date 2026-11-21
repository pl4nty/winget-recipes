import { defineShard } from 'anthelion';

// Graebert's help-center article lists every ARES Mechanical 2026 service pack (order varies between articles),
// so the highest build is picked. Upstream PackageVersion is <yy>.<sp>.<build> (from <yy>.<sp>.1.<build>).
export default defineShard(async () => {
	const article = 'https://help.graebert.com/en/articles/11080724-download-links-of-ares-mechanical-2026';
	const response = await fetch(article);
	if (!response.ok) throw new Error(`Graebert help article returned HTTP ${response.status}`);
	const html = await response.text();
	const builds = [
		...html.matchAll(/files\.graebert\.com\/aresmechanical\/(26)\.(\d+)\.1\.(\d+)\/(ARES_M_2026_SP\d+_26\.\d+\.1\.\d+_\d+)_x64\.exe/g),
	].map((m) => ({ version: `${m[1]}.${m[2]}.${m[3]}`, sp: Number(m[2]), build: Number(m[3]), path: `${m[1]}.${m[2]}.1.${m[3]}/${m[4]}_x64.exe` }));
	if (builds.length === 0) throw new Error('No ARES Mechanical 2026 x64 installer links in the help article');
	const latest = builds.reduce((a, b) => (b.sp > a.sp || (b.sp === a.sp && b.build > a.build) ? b : a));

	return {
		version: latest.version,
		urls: () => [`https://files.graebert.com/aresmechanical/${latest.path}`],
		releaseNotes: { releaseNotesUrl: 'https://help.graebert.com/en/collections/3612689-release-notes' },
	};
});

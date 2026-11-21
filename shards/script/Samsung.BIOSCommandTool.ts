import { defineShard } from 'anthelion';

// Samsung's Management Tools page links the current BIOS Command Tool zip on its download center;
// the link changes with each release, but the version is only in the tool itself.
export default defineShard(async () => {
	const page = await fetch('https://pcmanagement.biz.samsung.com/management-tools').then((response) => response.text());
	const link = /https?:\/\/(?:org\.)?downloadcenter\.samsung\.com\/[^"'\s<>]*?BASW[^"'\s<>]*?\.zip/i.exec(page)?.[0];
	if (!link) throw new Error('No BIOS Command Tool (BASW) zip link on the Management Tools page');
	const url = link.replaceAll('&amp;', '&');

	return {
		version: { source: 'product' },
		state: url,
		urls: () => [{ url, nestedInstallerMatches: ['SamsungBiosCommandTool.exe'] }],
		replace: true,
	};
});

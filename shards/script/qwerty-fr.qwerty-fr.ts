import { defineShard } from 'anthelion';
import { getLatestReleaseFromRedirect } from 'anthelion/github';
import { match } from 'anthelion/helpers';

// winget-pkgs versions this package by the MSI ProductVersion (1.0.3.40), not by
// the release tag (v0.7.3). The MSIs are built with MSKLC, which writes the
// layout's KLC VERSION followed by MSKLC's own build fields (.3.40), so the
// version is read from the KLC file at the release tag. One zip holds both the
// amd64 and i386 MSIs; the nested MSI paths stay as upstream has them.
export default defineShard(async () => {
	const { rawTag } = await getLatestReleaseFromRedirect({ owner: 'qwerty-fr', repo: 'qwerty-fr' });
	const klc = await fetch(
		`https://raw.githubusercontent.com/qwerty-fr/qwerty-fr/${rawTag}/windows/qwertyfr.utf16le-bom.klc`,
	)
		.then((response) => response.arrayBuffer())
		.then((buffer) => new TextDecoder('utf-16le').decode(buffer));
	const {
		captures: { klcVersion },
	} = match(klc, /^VERSION\s+(?<klcVersion>\d+\.\d+)\s*$/m);
	const tagVersion = rawTag.replace(/^v/, '');
	const url = `https://github.com/qwerty-fr/qwerty-fr/releases/download/${rawTag}/qwerty-fr_${tagVersion}_windows.zip`;

	return {
		version: `${klcVersion}.3.40`,
		urls: () => [
			{ url, architecture: 'x64' },
			{ url, architecture: 'x86' },
		],
		releaseNotes: { source: 'github', owner: 'qwerty-fr', repo: 'qwerty-fr', tag: rawTag },
	};
});

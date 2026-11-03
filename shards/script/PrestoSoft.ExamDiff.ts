import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';

// The product page carries the current version in its JSON-LD and the setup file code
// (194 for 1.9.4) in its download links. The history page's section for that release
// becomes the release notes, passed as a data: URL so the rest of the page is left out.
const site = 'https://www.prestosoft.com';

export default defineShard(async () => {
	const page = await fetch(`${site}/edp_examdiff.asp`).then((response) => response.text());
	const {
		groups: [version],
	} = match(page, /"softwareVersion":"(\d+(?:\.\d+)+)"/);
	const {
		groups: [code],
	} = match(page, /file=ed(\d+)_setup\.exe/);
	const release = version!.split('.').slice(0, 3).join('.');

	const history = await fetch(`${site}/edp_edhistory.asp`).then((response) => response.text());
	const {
		groups: [entry],
	} = match(
		history,
		new RegExp(`<a name="${release.replaceAll('.', '\\.')}"></a>[\\s\\S]*?</h2>\\s*</div>([\\s\\S]*?)<div class="heading-history">`),
	);

	return {
		version: version!,
		urls: () => [
			`${site}/download/ed${code}_setup.exe`,
			{ url: `${site}/download/ed${code}_setup.zip`, nestedInstallerMatches: ['setup.exe'] },
		],
		releaseNotes: {
			source: 'html',
			sourceUrl: `data:text/html,${encodeURIComponent(entry!)}`,
			releaseNotesUrl: `${site}/edp_edhistory.asp`,
			cleanup: false,
		},
	};
});

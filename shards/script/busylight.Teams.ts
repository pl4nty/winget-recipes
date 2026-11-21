import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';

const url = 'https://www.plenom.com/download/70652/';

// The download only reports its versioned filename in Content-Disposition on GET (HEAD returns nothing)
export default defineShard(async () => {
	const controller = new AbortController();
	const response = await fetch(url, { signal: controller.signal });
	const disposition = response.headers.get('content-disposition') ?? '';
	const type = response.headers.get('content-type');
	controller.abort();
	const {
		groups: [version],
	} = match(
		disposition,
		/Busylight-for-MS-Teams-Win-(\d+(?:\.\d+)+)\.zip/,
		`No versioned filename in Content-Disposition (status ${response.status}, content-type ${type}, disposition "${disposition}")`,
	);

	return {
		version,
		urls: () => [{ url, nestedInstallerMatches: ['Busylight4MS_Teams_Setup.msi'] }],
	};
});

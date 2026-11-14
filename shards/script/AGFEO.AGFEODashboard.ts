import { defineShard } from 'anthelion';

const BASE = 'https://info.agfeo.de/agfeo_web';

export default defineShard(async () => {
	// The software overview is a Domino form; selecting a component re-posts it.
	const page = await fetch(`${BASE}/hp3.nsf/softwareN_d!OpenForm&Seq=1`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
		body: new URLSearchParams({ __Click: '$Refresh', Wahl: 'AGFEO Dashboard', '%%Surrogate_Wahl': '1' }),
	}).then((response) => response.text());

	const { path, version } =
		/\/agfeo_web\/dokulib\.nsf\/(?<path>Anlage_w\/[0-9A-F]{32})\/\$FILE\/AGFEO-Dashboard-(?<version>\d+(?:\.\d+)+)-x64\.msi/i.exec(page)?.groups ?? {};
	if (!path || !version) throw new Error('AGFEO Dashboard x64 MSI not found');
	const notes = /\/agfeo_web\/DokuLib\.nsf\/(lu_04\/\d+_2)/i.exec(page)?.[1];

	return {
		version,
		urls: () => [`https://partner.agfeo.de/agfeo_web/dokulib.nsf/${path}/%24FILE/AGFEO-Dashboard-${version}-x64.msi`],
		...(notes && { releaseNotes: { releaseNotesUrl: `${BASE}/DokuLib.nsf/${notes}` } }),
	};
});

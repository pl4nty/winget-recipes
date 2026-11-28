import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';

// The NHI download page lists the ServiSign component under an opaque file id
// with no version; the version is only in the name of the installer inside
// the zip (NHIServiSignAdapterSetup_<version>.exe), so read it from there.
export default defineShard(async () => {
	const page = await fetch('https://med.nhi.gov.tw/iwse5000/IWSE5050S02.aspx?bc=CMS').then((response) =>
		response.text(),
	);
	const {
		captures: { seq },
	} = match(page, /ServiSign Windows 多元瀏覽器安裝元件<\/td><td><a [^>]*funDownload\(&#39;(?<seq>[0-9A-F]+)&#39;\)/);
	const url = `https://med.nhi.gov.tw/iwse5000/IWSE5050S03.aspx?AttSeq=${seq}`;
	const zip = Buffer.from(await fetch(url).then((response) => response.arrayBuffer())).toString('latin1');
	const {
		captures: { version },
	} = match(zip, /NHIServiSignAdapterSetup_(?<version>\d+(?:\.\d+)+)\.exe/);

	return {
		version,
		urls: () => [url],
	};
});

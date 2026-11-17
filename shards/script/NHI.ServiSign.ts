import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';

// The NHI download page lists the ServiSign component with an opaque file id
// and a ROC-calendar date but no version, so read the version from the
// installer and track the file id and date as state.
export default defineShard(async () => {
	const page = await fetch('https://med.nhi.gov.tw/iwse5000/IWSE5050S02.aspx?bc=CMS').then((response) =>
		response.text(),
	);
	const {
		captures: { seq, date },
	} = match(
		page,
		/ServiSign Windows 多元瀏覽器安裝元件<\/td><td><a [^>]*funDownload\(&#39;(?<seq>[0-9A-F]+)&#39;\)[\s\S]*?<td>(?<date>\d+\.\d+\.\d+)<\/td>/,
	);

	return {
		version: { source: 'product' },
		state: `${seq} ${date}`,
		urls: () => [`https://med.nhi.gov.tw/iwse5000/IWSE5050S03.aspx?AttSeq=${seq}`],
		replace: true,
	};
});

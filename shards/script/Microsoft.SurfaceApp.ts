import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';

export default defineShard(async () => {
	const html = await fetch('https://www.microsoft.com/download/details.aspx?id=105302').then((response) => response.text());
	const details = JSON.parse(match(html, /<script>window\.__DLCDetails__=(\{.+?\})<\/script>/is).groups[0]);
	const { name, url } = details.dlcDetailsView.downloadFile[0];

	return {
		version: match(name, /_(\d+\.\d+\.\d+)\.\d+_Desktop_/).groups[0],
		urls: () => [url],
	};
});

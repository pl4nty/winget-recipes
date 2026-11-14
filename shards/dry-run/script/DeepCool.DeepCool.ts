import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';

export default defineShard(async () => {
	const response = await fetch('https://hub.deepcool.com/official/software/official/download-path?version=latest&name=deep-creative').then((response) => response.text());
	const {
		groups: [url, version],
	} = match(response, /(https:\/\/[^"]+\/DeepCool-(\d+(?:\.\d+)+)-setup\.exe)/);
	return { version, urls: () => [url] };
});

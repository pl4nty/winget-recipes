import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';

export default defineShard(async () => {
	const response = await fetch(
		'https://live.elgato.webscale.site/graphql?query=query%20contentJson(%24identifier%3A%5BString%5D%24contentType%3AString%24options%3AContentJsonOptionsInput)%7BcontentJson(identifiers%3A%24identifier%20contentType%3A%24contentType%20options%3A%24options)%7Bidentifier%20entries%7D%7D&operationName=contentJson&variables=%7B%22contentType%22%3A%22downloads%22%2C%22identifier%22%3A%5B%22downloads%22%5D%2C%22options%22%3A%7B%22level%22%3A1%7D%7D&locale=en-US',
		{ headers: { 'x-pylot-query': 'contentJson', 'x-pylot-backend': 'elgato' } },
	).then((response) => response.json() as Promise<{ data: { contentJson: { entries: string }[] } }>);
	const { fileURLs } = JSON.parse(response.data.contentJson[0]!.entries).downloadData['wave-link-3-win'] as { fileURLs: { x86_64: string; arm64: string } };
	const {
		groups: [version],
	} = match(fileURLs.x86_64, /_(\d+(?:\.\d+){3})_/);
	return { version, urls: () => [fileURLs.x86_64, fileURLs.arm64] };
});

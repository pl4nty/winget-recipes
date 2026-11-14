import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';

export default defineShard(async () => {
	const response = await fetch('https://aka.ms/fslogix_download', { method: 'HEAD', redirect: 'manual' });
	const { captures } = match(
		response.headers.get('location') ?? '',
		/^(?<url>https:\/\/download\.microsoft\.com\/download\/[\w/-]+\/FSLogix_[\d.]+\.zip)$/,
		'No FSLogix download redirect found',
	);
	return { version: { source: 'product' }, urls: () => [captures.url!], state: captures.url! };
});

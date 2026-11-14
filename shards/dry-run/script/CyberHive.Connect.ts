import { defineShard } from 'anthelion';
import { compareVersions } from 'anthelion/helpers';
import { text } from '../lib/fetch.ts';

export default defineShard(async () => {
	const html = await text('https://pkgs.cyberhive.com/stable.html');
	const [latest] = [...html.matchAll(/href="(https:\/\/[^"]+\/cyberhive-connect_(\d+(?:\.\d+)+)-[0-9a-f]+\.exe)"/g)].sort((a, b) => compareVersions(b[2]!, a[2]!));
	if (!latest) throw new Error('No Windows installer link');
	return { version: latest[2]!, urls: () => [latest[1]!] };
});

import { defineShard } from 'anthelion';
import { latestUpstreamVersion } from '../lib/winget.ts';

export default defineShard(async () => {
	const current = await latestUpstreamVersion('Wingware.Wing.Personal');
	const response = await fetch('https://wingware.com/update', {
		method: 'POST',
		body: new URLSearchParams({ protocol: '1', prod: 'wing-personal', osname: 'win32', from_version: current, page: 'update', noheader: '1' }),
	}).then((response) => response.text());
	const version = response.match(/NEWER:(\d+(?:\.\d+)+)/)?.[1];
	if (!version) throw new Error(`No update after ${current}`);
	return { version, urls: () => [`https://wingware.com/pub/wing-personal/${version}/wing-personal-${version}.exe`] };
});

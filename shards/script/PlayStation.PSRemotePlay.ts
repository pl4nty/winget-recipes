import { defineShard } from 'anthelion';
import { isStateMatching, komac } from 'anthelion/helpers';
import ky from 'ky';

const base = 'https://remoteplay.dl.playstation.net/remoteplay/module/win';
const exe = `${base}/RemotePlayInstaller.exe`;

export default defineShard(async () => {
	const state = (await ky.head(exe)).headers.get('etag');
	if (!state) {
		throw new Error('No ETag header found');
	}

	// The unversioned InstallShield bootstrapper carries the full build number (e.g. 9.5.0.08040) that
	// names the versioned msi, so only analyse it when it has changed
	if (
		await isStateMatching({
			packageIdentifier: 'PlayStation.PSRemotePlay',
			state,
			ignoreQuotes: true,
		})
	) {
		return { version: { source: 'product' }, urls: () => [exe], state };
	}

	const { versions } = await komac.analyzeInstaller(exe);
	const version = versions.product?.trim();
	if (!version) {
		throw new Error('No ProductVersion found');
	}

	return {
		version,
		urls: () => [
			{ url: `${base}/RemotePlayInstaller_${version}_x64.msi`, architecture: 'x64' },
			{ url: exe, architecture: 'x64' },
		],
		state,
	};
});

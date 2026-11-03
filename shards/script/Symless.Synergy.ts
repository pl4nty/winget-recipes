import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';

// Symless publishes the current Synergy 3 version without sign-in, but its
// installer downloads need a per-account token, which a shard cannot get.
export default defineShard(async () => {
	const text = await fetch('https://api.symless.com/version/synergy3').then((response) => response.text());
	const {
		captures: { version },
	} = match(text, /^(?<version>\d+(?:\.\d+)+)-stable$/);
	const base = 'https://symless.com/synergy/api/download';

	return {
		version,
		urls: () => [`${base}/synergy-${version}-windows-x64.msi`, `${base}/synergy-${version}-windows-arm64.msi`],
	};
});

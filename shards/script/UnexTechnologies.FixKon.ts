import { defineShard } from 'anthelion';
import { isStateMatching, komac, match } from 'anthelion/helpers';

// api.fixkon.com/download redirects to the newest installer, but neither the
// redirect nor any page names its version. Upstream pins each manifest to
// api.fixkon.com/download/<version> (stable bytes), so take the release asset
// id from the redirect as state, read the version from the installer only when
// it changed, and return the pinned URL.
const packageIdentifier = 'UnexTechnologies.FixKon';
const latest = 'https://api.fixkon.com/download';

export default defineShard(async () => {
	const response = await fetch(latest, { redirect: 'manual' });
	const {
		captures: { state },
	} = match(response.headers.get('location'), /release-asset\/\d+\/(?<state>[0-9a-f-]{36})/);

	if (await isStateMatching({ packageIdentifier, state })) {
		return { version: { source: 'display' }, urls: () => [latest], state };
	}

	const { installers, versions } = await komac.analyzeInstaller(latest);
	const version = installers[0]?.appsAndFeaturesEntries[0]?.displayVersion ?? versions.product;
	if (!version) {
		throw new Error('No version found in the FixKon installer');
	}

	return { version, urls: () => [`${latest}/${version}`], state };
});

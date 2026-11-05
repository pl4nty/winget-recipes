import { defineShard } from 'anthelion';
import { getLatestReleaseFromRedirect } from 'anthelion/github';

// Tags are three-part (v1.0.0) but the MSI and upstream PackageVersion are
// four-part (1.0.0.0), so pad the tag version to four parts.
export default defineShard(async () => {
	const release = await getLatestReleaseFromRedirect({
		owner: 'Prantheman1',
		repo: 'SWE40006-CreditCalculator',
	});

	const parts = release.version.split('.');
	while (parts.length < 4) parts.push('0');

	return {
		version: parts.join('.'),
		urls: () => [`https://github.com/Prantheman1/SWE40006-CreditCalculator/releases/download/${release.rawTag}/CreditCalculatorSetup.msi`],
	};
});

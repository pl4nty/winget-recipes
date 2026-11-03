import { defineShard } from 'anthelion';

export default defineShard(async () => {
	// The ConnectWise PSA cloud reports its release (for example v2025.1) on the public login endpoint.
	const { VersionCode } = await fetch('https://na.myconnectwise.net/login/companyinfo/connectwise').then((response) =>
		response.json(),
	);
	const [, year, release] = /^v?(\d{4})\.(\d+)$/.exec(VersionCode) ?? [];
	if (!year || !release) throw new Error(`Unexpected VersionCode: ${VersionCode}`);

	// The client lives under install/<year>.<release>.<patch>/; take the highest patch that exists.
	const installer = (patch: number) =>
		`https://university.connectwise.com/install/${year}.${release}.${patch}/ConnectWise-Manage-Internet-Client-x64.msi`;
	let patch = -1;
	for (let candidate = 9; candidate >= 0; candidate--) {
		const response = await fetch(installer(candidate), { method: 'HEAD' });
		if (response.ok) {
			patch = candidate;
			break;
		}
	}
	if (patch < 0) throw new Error(`No ConnectWise PSA client found for ${year}.${release}`);

	return {
		version: `${Number(year) % 100}.${release}.${patch}`,
		urls: () => [installer(patch)],
	};
});

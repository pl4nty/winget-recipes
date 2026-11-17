import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';

// The vendor's installer download only names the current release in its Content-Disposition header (UE-Explorer.<version>.zip).
export default defineShard(async () => {
	const response = await fetch('https://eliotvu.com/download/ue-explorer/release/windows-x64/installer', {
		headers: { range: 'bytes=0-0' },
	});
	const disposition = response.headers.get('content-disposition');
	await response.body?.cancel();
	const {
		captures: { version },
	} = match(disposition, /UE-Explorer\.(?<version>\d+(?:\.\d+)+)\.zip/i, 'No UE Explorer release found');

	return {
		version,
		urls: () => [`https://eliotvu.com/updates/ue-explorer.${version}.msi`],
	};
});

import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';

// The vendor's msi.php endpoint always serves the latest MSI and names it in
// the Content-Disposition header (WixPie_v<version>.msi). The path after
// msi.php is ignored by the server, so it carries the version to give each
// release a distinct InstallerUrl, like upstream does.
export default defineShard(async () => {
	const response = await fetch('https://downloads.wixpie.com/msi.php', { method: 'HEAD' });
	const {
		captures: { version },
	} = match(
		response.headers.get('content-disposition'),
		/filename="?WixPie_v(?<version>\d+(?:\.\d+)+)\.msi/i,
	);

	return {
		version,
		urls: () => [`https://downloads.wixpie.com/msi.php/WixPie_v${version}.msi`],
	};
});

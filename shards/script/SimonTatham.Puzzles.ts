import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';

// The installer link redirects to a file named by build date, not the MSI version; the version comes from the installer.
export default defineShard(async () => {
	const { url } = await fetch('https://www.chiark.greenend.org.uk/~sgtatham/puzzles/puzzles-installer.msi', { method: 'HEAD' });
	match(url, /^(https:\/\/www\.chiark\.greenend\.org\.uk\/~sgtatham\/puzzles\/puzzles-\d{8}\.[0-9a-f]+-installer\.msi)$/, `Unexpected redirect: ${url}`);

	return { version: { source: 'display' }, urls: () => [url], state: url, replace: true };
});

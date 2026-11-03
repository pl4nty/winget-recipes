import { defineShard } from 'anthelion';
import { compareVersions } from 'anthelion/helpers';

export default defineShard(async () => {
	const listing = await fetch(
		'https://pcstwinget.blob.core.windows.net/pc-servicetool-images?restype=container&comp=list',
	).then((response) => response.text());
	const files = [...listing.matchAll(/<Name>Remeha_Pro_(\d+_\d+_\d+)\.msi<\/Name>/g)].map((m) => m[1]);
	if (files.length === 0) throw new Error('No Remeha PRO MSI found in container listing');
	const file = files.sort((a, b) => compareVersions(a.replaceAll('_', '.'), b.replaceAll('_', '.'))).at(-1)!;

	return {
		version: file.replaceAll('_', '.'),
		urls: () => [`https://pcstwinget.blob.core.windows.net/pc-servicetool-images/Remeha_Pro_${file}.msi`],
	};
});

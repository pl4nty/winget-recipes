import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';

// The product page links the release notes of the current major; the installer folder is named after the major.
export default defineShard(async () => {
	const product = await fetch('https://biognosys.com/software/spectronaut/').then((response) => response.text());
	const {
		captures: { notes },
	} = match(product, /href="(?<notes>https:\/\/biognosys\.com\/resources\/spectronaut\d+-release-notes\/)"/i, 'No Spectronaut release notes link found');
	const page = await fetch(notes).then((response) => response.text());
	const {
		captures: { version, major },
	} = match(page, /\[(?:Hot-?Fix|Update)\s+(?<version>(?<major>\d+)\.\d+\.\d+\.\d+)\]/i, 'No Spectronaut version found');

	return {
		version,
		urls: () => [`https://files.biognosys.com/058_Spectronaut/Installer/SN${major}/Spectronaut_${version}_setup.exe`],
		releaseNotes: { releaseNotesUrl: notes },
	};
});

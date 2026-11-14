import { defineShard } from 'anthelion';
import { dellModelPackage } from '../lib/Dell.ts';

// Latitude 9450 2-in-1 lists the current x64 build; no public catalog lists the current ARM64 build.
export default defineShard(async () => {
	const { url, version } = await dellModelPackage('0CC6', /[^"]*Dell-Optimizer-Application_[^"]*_WIN64_[^"]*\.EXE/);
	return { version, urls: () => [url] };
});

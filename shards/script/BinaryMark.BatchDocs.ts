import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';

// The product page states the major.minor version and its product id; the installer file name
// is pid + 3-digit product id + 2-digit major + 2-digit minor (pid0210500t.exe for pid 21, 5.0)
export default defineShard(async () => {
	const page = await fetch('https://www.binarymark.com/products/bulk-document-processor').then((response) => response.text());
	const {
		captures: { version, major, minor },
	} = match(page, /Latest product version is: (?<version>(?<major>\d+)\.(?<minor>\d+))"/);
	const {
		captures: { pid },
	} = match(page, /development\?pid=(?<pid>\d+)/);
	const pad = (value: string, length: number) => value.padStart(length, '0');

	return {
		version,
		urls: () => [
			`https://download.binarymark.com/packages/pid${pad(pid, 3)}${pad(major, 2)}${pad(minor, 2)}t.exe`,
		],
	};
});

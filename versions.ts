// Ports winget's Version ordering (src/AppInstallerSharedLib/Versions.cpp).
export function compareVersions(a: string, b: string) {
	const parts = (version: string) => {
		const digit = version.search(/\d/);
		const split = version.indexOf('.');
		if (digit >= 0 && (split < 0 || digit < split)) version = version.slice(digit);
		return version.split('.').map((part) => {
			const [, number = '', other = ''] = /^(\d*)(.*)$/.exec(part.trim())!;
			return [Number(number), other.toLowerCase()] as const;
		});
	};
	const [left, right] = [parts(a.trim()), parts(b.trim())];
	for (let i = 0; i < Math.max(left.length, right.length); i++) {
		const [x, xo] = left[i] ?? [0, ''];
		const [y, yo] = right[i] ?? [0, ''];
		if (x !== y) return x - y;
		if (xo !== yo) return !xo ? 1 : !yo ? -1 : xo < yo ? -1 : 1;
	}
	return 0;
}

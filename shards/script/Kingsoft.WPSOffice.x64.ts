import { defineShard } from 'anthelion';

// platformUrlsv3 backs the download buttons on platform.wps.cn. The 64-bit
// Windows build is the productList entry whose button links to WPS_Setup_x64_<build>.exe.
export default defineShard(async () => {
	const { productList } = (await fetch('https://www.wps.cn/platformUrlsv3').then((response) =>
		response.json(),
	)) as { productList: { os: string; productVcode: string; productButtonUrl: string }[] };
	const product = productList.find(
		(item) => item.os === 'win' && /\/WPS_Setup_x64_\d+\.exe$/.test(item.productButtonUrl),
	);
	if (!product) throw new Error('No x64 Windows build found in platformUrlsv3');

	return {
		version: product.productVcode,
		urls: () => [product.productButtonUrl],
	};
});

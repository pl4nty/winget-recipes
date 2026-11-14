import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';

// The product page links the setup on Versa's Aliyun OSS bucket, with the
// version in the file name as underscores (不咕剪辑专业版1_2_0.exe -> 1.2.0).
export default defineShard(async () => {
	const html = await fetch('https://bugu.versa-ai.com/').then((response) =>
		response.text(),
	);
	const {
		captures: { file, raw },
	} = match(
		html,
		/https:\/\/versa-static\.oss-cn-shanghai\.aliyuncs\.com\/pc\/release\/(?<file>(?:不咕剪辑专业版|%E4%B8%8D%E5%92%95%E5%89%AA%E8%BE%91%E4%B8%93%E4%B8%9A%E7%89%88)(?<raw>\d+(?:_\d+)+)\.exe)/,
	);
	const version = raw.replaceAll('_', '.');

	return {
		version,
		urls: () => [
			`https://versa-static.oss-cn-shanghai.aliyuncs.com/pc/release/${encodeURI(decodeURI(file))}`,
		],
	};
});

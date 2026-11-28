import { defineShard } from 'anthelion';

export default defineShard(async () => {
	const { result } = (await fetch('https://qiyukf.com/download/getDownloadInfoV2?type=pcWorkstation').then((response) => response.json())) as { result: { pcWorkstation: { version: string } } };
	const tag = result.pcWorkstation.version;
	return { version: tag.replace(/^v/, ''), urls: () => [`https://ysf.qiyukf.net/QIYU_PC_Setup_${tag}.exe`] };
});

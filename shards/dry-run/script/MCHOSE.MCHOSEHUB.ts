import { defineShard } from 'anthelion';

export default defineShard(async () => {
	const { data } = (await fetch('https://www.maicong.cn/mc/client/findByPage?page=second_client_driver').then((response) => response.json())) as { data: { driver: { content: string }[] } };
	const { download_url: url } = JSON.parse(data.driver[1]!.content) as { download_url: string };
	return { version: { source: 'product' }, urls: () => [{ url, nestedInstallerMatches: ['installer.exe'] }] };
});

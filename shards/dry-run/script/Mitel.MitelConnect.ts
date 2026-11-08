import { defineShard } from 'anthelion';

export default defineShard(() => ({ version: { source: 'product' }, urls: () => ['https://upgrade01.sky.shoretel.com/ClientInstall'] }));

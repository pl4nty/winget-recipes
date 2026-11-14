import { defineShard } from 'anthelion';

export default defineShard(() => ({ version: { source: 'display' }, urls: () => ['https://coolselector.danfoss.com/Coolselector2/setup.exe'] }));

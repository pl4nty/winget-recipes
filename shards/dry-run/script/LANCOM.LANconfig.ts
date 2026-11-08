import { defineShard } from 'anthelion';
import { lancom } from '../lib/LANCOM.ts';

export default defineShard(() => lancom(/\/LANconfig-[\d.]+-[^"']*\.exe/));

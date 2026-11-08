import { defineShard } from 'anthelion';
import { lancom } from '../lib/LANCOM.ts';

export default defineShard(() => lancom(/\/LANCOM-Wireless-ePaper-Server-[\d.]+-Rel\.exe/));

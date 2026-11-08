import { defineShard } from 'anthelion';
import { sqliteExpert } from '../lib/CoralCreek.ts';

export default defineShard(() => sqliteExpert('Pers'));

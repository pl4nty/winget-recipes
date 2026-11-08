import { defineShard } from 'anthelion';
import { text } from './fetch.ts';

export function sqliteExpert(edition: string) {
	return defineShard(async () => {
		const page = 'https://www.sqliteexpert.com/download.html';
		const html = await text(page);
		const urls = ['32', '64'].map((bits) => {
			const href = html.match(new RegExp(`href="([^"]*SQLiteExpert${edition}Setup${bits}\\.exe)"`))?.[1];
			if (!href) throw new Error(`No ${edition} ${bits}-bit link`);
			return new URL(href, page).href;
	});
	return { version: { source: 'file' as const }, urls: () => urls };
	});
}

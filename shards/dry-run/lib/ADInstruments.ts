import { defineShard } from 'anthelion';

// ADInstruments update plists list each app as a <dict> of <key>/<string> pairs.
export function adinstrumentsApp(id: string, plist = 'https://www.adinstruments.com/LabChart8SoftwareUpdateWin.plist', languageId?: string) {
	return defineShard(async () => {
		const text = await fetch(plist).then((response) => response.text());
		for (const dict of text.split('<dict>')) {
			const values = Object.fromEntries([...dict.matchAll(/<key>([^<]+)<\/key>\s*<(?:string|integer|real)>([^<]*)</g)].map(([, key, value]) => [key!, value!]));
			if (values.ID === id && (!languageId || values.LanguageID === languageId)) {
				return { version: { source: 'display' }, urls: () => [new URL(values.DownloadURL!, 'https://cdn.adinstruments.com/').href] };
			}
		}
		throw new Error(`No ${id} in ${plist}`);
	});
}

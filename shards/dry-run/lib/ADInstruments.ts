// ADInstruments update plists list each app as a <dict> of <key>/<string> pairs.
export async function adinstrumentsApp(plist: string, id: string, languageId?: string) {
	const text = await fetch(plist).then((response) => response.text());
	for (const dict of text.split('<dict>')) {
		const values = Object.fromEntries([...dict.matchAll(/<key>([^<]+)<\/key>\s*<(?:string|integer|real)>([^<]*)</g)].map(([, key, value]) => [key!, value!]));
		if (values.ID === id && (!languageId || values.LanguageID === languageId)) return values;
	}
	throw new Error(`No ${id} in ${plist}`);
}

export const labChartApps = 'https://www.adinstruments.com/LabChart8SoftwareUpdateWin.plist';

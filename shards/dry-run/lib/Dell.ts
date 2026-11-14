import { inflateRawSync } from 'node:zlib';

// Extracts the single file in an MSZIP cabinet such as Dell's CatalogPC.cab.
export function extractCab(cab: Buffer) {
	if (cab.toString('latin1', 0, 4) !== 'MSCF') throw new Error('Not a cabinet');
	const folders = cab.readUInt16LE(26);
	const flags = cab.readUInt16LE(30);
	let offset = 36;
	let dataReserve = 0;
	if (flags & 4) {
		offset += 4 + cab.readUInt16LE(36);
		dataReserve = cab.readUInt8(39);
	}
	if (folders !== 1) throw new Error(`Expected 1 cabinet folder, found ${folders}`);
	let position = cab.readUInt32LE(offset);
	const blocks = cab.readUInt16LE(offset + 4);
	if ((cab.readUInt16LE(offset + 6) & 0xf) !== 1) throw new Error('Cabinet is not MSZIP compressed');
	const chunks: Buffer[] = [];
	let history = Buffer.alloc(0);
	for (let block = 0; block < blocks; block++) {
		const size = cab.readUInt16LE(position + 4);
		const start = position + 8 + dataReserve;
		if (cab.toString('latin1', start, start + 2) !== 'CK') throw new Error('Bad MSZIP block');
		const chunk = inflateRawSync(cab.subarray(start + 2, start + size), history.length ? { dictionary: history } : {});
		chunks.push(chunk);
		history = Buffer.concat([history, chunk]).subarray(-32768);
		position = start + size;
	}
	return Buffer.concat(chunks);
}

async function cabText(url: string) {
	const xml = extractCab(Buffer.from(await fetch(url).then((response) => response.arrayBuffer())));
	return xml.toString(xml[0] === 0xff && xml[1] === 0xfe ? 'utf16le' : 'utf8');
}

// Finds a package path in the catalog of one Dell model, by its BIOS system ID.
export async function dellModelPackage(systemId: string, path: RegExp) {
	const index = await cabText('https://downloads.dell.com/catalog/CatalogIndexPC.cab');
	const group = index.split('<GroupManifest').find((group) => group.includes(`systemID="${systemId}"`));
	const catalog = group?.match(/<ManifestInformation [^>]*path="([^"]+)"/)?.[1];
	if (!catalog) throw new Error(`No Dell catalog for system ${systemId}`);
	const tag = (await cabText(`https://downloads.dell.com/${catalog}`)).match(new RegExp(`<SoftwareComponent [^>]*path="${path.source}"[^>]*>`))?.[0];
	if (!tag) throw new Error(`No ${path} in ${catalog}`);
	const attribute = (name: string) => tag.match(new RegExp(` ${name}="([^"]+)"`))![1]!;
	return { url: `https://dl.dell.com/${attribute('path')}`, version: attribute('vendorVersion') };
}

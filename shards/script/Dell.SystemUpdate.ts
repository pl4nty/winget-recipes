import { defineShard } from 'anthelion';
import { compareVersions } from 'anthelion/helpers';

// Dell System Update is published in Dell's enterprise catalog (gzipped UTF-16 XML). Each release gets a
// new release ID and download folder, so read every "DELL System Update" component and pick the newest.
export default defineShard(async () => {
	const response = await fetch('https://downloads.dell.com/catalog/Catalog.xml.gz');
	if (!response.ok) throw new Error(`Dell catalog returned ${response.status}`);
	const catalog = new TextDecoder('utf-16le').decode(Bun.gunzipSync(new Uint8Array(await response.arrayBuffer())));

	const releases = [
		...catalog.matchAll(/<SoftwareComponent\b([^>]*)>(?:(?!<\/SoftwareComponent>)[\s\S])*?DELL System Update, v\./gi),
	].flatMap(([, attributes]) => {
		const version = /\bvendorVersion="(\d+(?:\.\d+)+)"/i.exec(attributes!)?.[1];
		const path = /\bpath="(FOLDER\d+M\/\d+\/Systems-Management_Application_[A-Z0-9]+_WN64_[^"]+\.EXE)"/i.exec(attributes!)?.[1];
		const releaseId = /\breleaseID="([A-Z0-9]+)"/i.exec(attributes!)?.[1];
		return version && path && releaseId ? [{ version, path, releaseId }] : [];
	});
	const release = releases.sort((a, b) => compareVersions(a.version, b.version)).at(-1);
	if (!release) throw new Error('No Dell System Update package found in the Dell catalog');

	return {
		version: release.version,
		urls: () => [`https://downloads.dell.com/${release.path}`],
		releaseNotes: { releaseNotesUrl: `https://www.dell.com/support/home/drivers/driversdetails?driverid=${release.releaseId}` },
	};
});

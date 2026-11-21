import { defineShard } from 'anthelion';

// winget-pkgs drops the NIK build suffix (23.0.5+1 is 23.0.5), which JSON placeholders can't strip.
type Release = { version: string; downloadUrl: string };

export default defineShard(async () => {
	const [release]: Release[] = await fetch(
		'https://api.bell-sw.com/v1/nik/releases?os=windows&arch=x86&bitness=64&package-type=msi&bundle-type=standard&component-version=liberica%4021&version-modifier=latest',
	).then((response) => response.json());
	if (!release) throw new Error('No Liberica NIK release for JDK 21');

	return {
		version: release.version.replace(/\+\d+$/, ''),
		urls: () => [release.downloadUrl],
	};
});

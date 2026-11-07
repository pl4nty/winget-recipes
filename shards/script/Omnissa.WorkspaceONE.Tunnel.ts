import { defineShard } from 'anthelion';

// Omnissa's public Customer Connect API lists the current Windows download
// group (WS1-TUNNEL-WIN-<yymm>) and its files with version and build numbers.
// The installers themselves are served from packages.omnissa.com, named with
// the release code and the per-architecture build.
const api = 'https://customerconnect.omnissa.com/channel/public/api/v1.0';

type Group = { name: string; dlgList: { code: string; productId: string; releasePackageId: string }[] };
type File = { fileName: string; build: string; version: string; title: string };

export default defineShard(async () => {
	const { dlgEditionsLists } = (await fetch(
		`${api}/products/getRelatedDLGList?locale=en_US&category=security_and_compliance&product=omnissa_workspace_one_tunnel&version=1_0&dlgType=PRODUCT_BINARY`,
	).then((response) => response.json())) as { dlgEditionsLists: Group[] };
	const group = dlgEditionsLists.find(({ name }) => name === 'Workspace ONE Tunnel for Windows')?.dlgList[0];
	if (!group) throw new Error('Workspace ONE Tunnel for Windows download group not found');

	const { downloadFiles } = (await fetch(
		`${api}/dlg/details?locale=en_US&downloadGroup=${group.code}&productId=${group.productId}&rPId=${group.releasePackageId}`,
	).then((response) => response.json())) as { downloadFiles: File[] };
	const build = (arch: string) => {
		const file = downloadFiles.find(({ fileName }) => fileName.startsWith(`WorkspaceOneTunnelInstaller.${arch}.`));
		if (!file) throw new Error(`No ${arch} installer in ${group.code}`);
		return file;
	};
	const x64 = build('x64');
	const arm64 = build('arm64');
	const version = x64.version;
	const code = version.replace('.', '');
	const base = `https://packages.omnissa.com/winapps/WS1/Tunnel/${code}`;

	return {
		version,
		urls: () => [
			`${base}/WorkspaceOneTunnelInstaller_${code}_${x64.build}.exe`,
			`${base}/WorkspaceONETunnelClient_${code}_${x64.build}.msi`,
			`${base}/WorkspaceOneTunnelInstaller_ARM_${code}_${arm64.build}.exe`,
			`${base}/WorkspaceONETunnelClient_ARM_${code}_${arm64.build}.msi`,
		],
		releaseNotes: {
			releaseNotesUrl: 'https://docs.omnissa.com/bundle/Workspace_ONE_Tunnel_Windows-RN/page/Tunnel-Windows-ReleaseNotes.html',
		},
	};
});

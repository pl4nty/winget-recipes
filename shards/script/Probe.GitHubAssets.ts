import { defineShard } from 'anthelion';
import { githubClient } from 'anthelion/github';

const repos: Record<string, [string, string, string]> = {
	"Microsoft.AppInstaller": [
		"microsoft",
		"winget-cli",
		"stable"
	],
	"Microsoft.AppLockerPolicyConverter": [
		"MicrosoftDocs",
		"WDAC-Toolkit",
		"stable"
	],
	"Microsoft.AxeWindows": [
		"microsoft",
		"axe-windows",
		"stable"
	],
	"Microsoft.Azure.ADConnectSyncDocumenter": [
		"microsoft",
		"AADConnectConfigDocumenter",
		"stable"
	],
	"Microsoft.Azure.AztfExport": [
		"Azure",
		"aztfexport",
		"stable"
	],
	"Microsoft.Azure.Aztfy": [
		"Azure",
		"aztfy",
		"stable"
	],
	"Microsoft.Azure.CloudHSM-ClientSDK": [
		"microsoft",
		"MicrosoftAzureCloudHSM",
		"stable"
	],
	"Microsoft.Azure.IoTExplorer": [
		"Azure",
		"azure-iot-explorer",
		"stable"
	],
	"Microsoft.Azure.QuickReview": [
		"Azure",
		"azqr",
		"stable"
	],
	"Microsoft.Azure.aks-engine-azurestack": [
		"Azure",
		"aks-engine-azurestack",
		"stable"
	],
	"Microsoft.BotFrameworkComposer": [
		"microsoft",
		"BotFramework-Composer",
		"stable"
	],
	"Microsoft.BotFrameworkEmulator": [
		"microsoft",
		"BotFramework-Emulator",
		"stable"
	],
	"Microsoft.CmdPalAzureExtension": [
		"microsoft",
		"CmdPalAzureExtension",
		"stable"
	],
	"Microsoft.CmdPalGitHubExtension": [
		"microsoft",
		"CmdPalGitHubExtension",
		"stable"
	],
	"Microsoft.Coreutils": [
		"microsoft",
		"coreutils",
		"stable"
	],
	"Microsoft.DSC": [
		"PowerShell",
		"DSC",
		"stable"
	],
	"Microsoft.DevSkim.CLI.DotNetTool": [
		"microsoft",
		"DevSkim",
		"stable"
	],
	"Microsoft.DevSkim.CLI.LibraryPackage": [
		"microsoft",
		"DevSkim",
		"stable"
	],
	"Microsoft.DotNet.CodeContracts": [
		"microsoft",
		"CodeContracts",
		"stable"
	],
	"Microsoft.Edit": [
		"microsoft",
		"edit",
		"stable"
	],
	"Microsoft.EnterpriseStateClassify": [
		"microsoft",
		"EnterpriseStateClassify",
		"stable"
	],
	"Microsoft.FoundryDevPack": [
		"microsoft",
		"foundry-dev-tools",
		"all"
	],
	"Microsoft.Gaming.GDK.XboxGamePackageManager": [
		"microsoft",
		"PackageUploader",
		"stable"
	],
	"Microsoft.Gaming.GDK": [
		"microsoft",
		"GDK",
		"stable"
	],
	"Microsoft.Gaming.RemoteIterationClient": [
		"microsoft",
		"GDK",
		"stable"
	],
	"Microsoft.Gaming.RemoteIterationEndpoint": [
		"microsoft",
		"GDK",
		"stable"
	],
	"Microsoft.Gaming.TAK.CLI": [
		"microsoft",
		"xbox-game-streaming-tools",
		"stable"
	],
	"Microsoft.HIDTools.Waratah": [
		"microsoft",
		"hidtools",
		"stable"
	],
	"Microsoft.IIS.ServiceMonitor": [
		"microsoft",
		"IIS.ServiceMonitor",
		"stable"
	],
	"Microsoft.IntelligentTerminal": [
		"microsoft",
		"intelligent-terminal",
		"stable"
	],
	"Microsoft.Kanagawa": [
		"microsoft",
		"kanagawa",
		"stable"
	],
	"Microsoft.M365AgentsPlayground": [
		"OfficeDev",
		"microsoft-365-agents-toolkit",
		"all"
	],
	"Microsoft.MFCMapi": [
		"microsoft",
		"mfcmapi",
		"stable"
	],
	"Microsoft.OpenCLGLVulkanCompatibilityPack": [
		"microsoft",
		"OpenCLOn12",
		"stable"
	],
	"Microsoft.PICT": [
		"microsoft",
		"pict",
		"stable"
	],
	"Microsoft.Pave": [
		"microsoft",
		"pave",
		"stable"
	],
	"Microsoft.PowerShell": [
		"PowerShell",
		"PowerShell",
		"stable"
	],
	"Microsoft.PowerToys": [
		"microsoft",
		"PowerToys",
		"stable"
	],
	"Microsoft.ProfileExplorer": [
		"microsoft",
		"profile-explorer",
		"stable"
	],
	"Microsoft.ProjectTelescope": [
		"microsoft",
		"project-telescope",
		"stable"
	],
	"Microsoft.SBOMTool": [
		"microsoft",
		"sbom-tool",
		"stable"
	],
	"Microsoft.ScreenRecorder": [
		"microsoft",
		"screenrecorder",
		"stable"
	],
	"Microsoft.ShellUse": [
		"microsoft",
		"tui-test",
		"all"
	],
	"Microsoft.SmartDump": [
		"microsoft",
		"SmartDump",
		"stable"
	],
	"Microsoft.Tokenizer": [
		"microsoft",
		"Tokenizer",
		"stable"
	],
	"Microsoft.VSIXBootstrapper": [
		"microsoft",
		"vsixbootstrapper",
		"stable"
	],
	"Microsoft.VisualStudio.Locator": [
		"microsoft",
		"vswhere",
		"stable"
	],
	"Microsoft.VisualStudio.Professional.Insiders": [
		"gvshemanth30034",
		"winget-pkgs",
		"stable"
	],
	"Microsoft.WinAppCli": [
		"microsoft",
		"winappcli",
		"stable"
	],
	"Microsoft.WinGetStudio.Experimental": [
		"microsoft",
		"winget-studio",
		"stable"
	],
	"Microsoft.WindowsApplicationDriver": [
		"microsoft",
		"WinAppDriver",
		"stable"
	],
	"Microsoft.WindowsBatteryLifeTool": [
		"microsoft",
		"WebBrowsingPowerRelease",
		"stable"
	],
	"Microsoft.WindowsBusesTracing": [
		"microsoft",
		"busiotools",
		"stable"
	],
	"Microsoft.WindowsTerminal.Preview": [
		"microsoft",
		"terminal",
		"prerelease"
	],
	"Microsoft.WindowsTerminal": [
		"microsoft",
		"terminal",
		"stable"
	],
	"Microsoft.WingetCreate": [
		"microsoft",
		"winget-create",
		"stable"
	],
	"Microsoft.eBPFforWindows": [
		"microsoft",
		"ebpf-for-windows",
		"all"
	],
	"Microsoft.etl2pcapng": [
		"microsoft",
		"etl2pcapng",
		"stable"
	],
	"Microsoft.quicreach": [
		"microsoft",
		"quicreach",
		"stable"
	],
	"Microsoft.vott": [
		"microsoft",
		"VoTT",
		"stable"
	],
	"Microsoft.winfile": [
		"microsoft",
		"winfile",
		"stable"
	],
	"Microsoft.Azure.BatchExplorer": [
		"Azure",
		"BatchExplorer",
		"stable"
	],
	"Microsoft.AzureMediaServicesExplorer": [
		"Azure",
		"Azure-Media-Services-Explorer",
		"all"
	],
	"Microsoft.CsWinRT": [
		"microsoft",
		"CsWinRT",
		"stable"
	],
	"Microsoft.DSC.Preview": [
		"PowerShell",
		"DSC",
		"prerelease"
	],
	"Microsoft.DirectX.CapsViewer": [
		"microsoft",
		"DxCapsViewer",
		"stable"
	],
	"Microsoft.DirectX.Mesh": [
		"microsoft",
		"DirectXMesh",
		"stable"
	],
	"Microsoft.DirectX.ToolKit.MakeSpriteFont": [
		"microsoft",
		"DirectXTK",
		"stable"
	],
	"Microsoft.DirectX.ToolKit.XWBTool": [
		"microsoft",
		"DirectXTK",
		"stable"
	],
	"Microsoft.DirectX.UVAtlas": [
		"microsoft",
		"UVAtlas",
		"stable"
	],
	"Microsoft.DirectXTex.Texassemble": [
		"microsoft",
		"DirectXTex",
		"stable"
	],
	"Microsoft.DirectXTex.Texconv": [
		"microsoft",
		"DirectXTex",
		"stable"
	],
	"Microsoft.DirectXTex.Texdiag": [
		"microsoft",
		"DirectXTex",
		"stable"
	],
	"Microsoft.DotNet.Native.Runtime": [
		"microsoft",
		"busiotools",
		"stable"
	],
	"Microsoft.Gaming.XboxLiveDeveloperTools": [
		"microsoft",
		"xbox-live-developer-tools",
		"stable"
	],
	"Microsoft.Git": [
		"microsoft",
		"git",
		"stable"
	],
	"Microsoft.IronPython.2": [
		"IronLanguages",
		"ironpython2",
		"stable"
	],
	"Microsoft.MIDI.SDK": [
		"microsoft",
		"MIDI",
		"all"
	],
	"Microsoft.MSIX-Toolkit": [
		"microsoft",
		"MSIX-Toolkit",
		"stable"
	],
	"Microsoft.MSIXCore": [
		"microsoft",
		"msix-packaging",
		"stable"
	],
	"Microsoft.OpenSSH.Preview": [
		"PowerShell",
		"Win32-OpenSSH",
		"all"
	],
	"Microsoft.PowerShell.Preview": [
		"PowerShell",
		"PowerShell",
		"prerelease"
	],
	"Microsoft.TeamMate": [
		"microsoft",
		"TeamMate",
		"stable"
	],
	"Microsoft.UI.Xaml.2.7": [
		"microsoft",
		"microsoft-ui-xaml",
		"stable"
	],
	"Microsoft.UI.Xaml.2.8": [
		"microsoft",
		"microsoft-ui-xaml",
		"stable"
	],
	"Microsoft.VCLibs.14": [
		"microsoft",
		"winget-cli",
		"stable"
	],
	"Microsoft.VCLibs.Desktop.14": [
		"microsoft",
		"winget-cli",
		"stable"
	],
	"Microsoft.VisualStudio.ConfigFinder": [
		"microsoft",
		"VSConfigFinder",
		"all"
	],
	"Microsoft.VisualTrueType": [
		"microsoft",
		"VisualTrueType",
		"stable"
	],
	"Microsoft.WindowsMIDIServicesSDK": [
		"microsoft",
		"MIDI",
		"all"
	],
	"Microsoft.bitsmanager": [
		"microsoft",
		"BITS-Manager",
		"stable"
	],
	"Microsoft.AppInstallerFileBuilder": [
		"microsoft",
		"MSIX-Toolkit",
		"all"
	],
	"Microsoft.FoundryLocal": [
		"microsoft",
		"Foundry-Local",
		"all"
	],
	"Microsoft.MRDL.UnityPeriodicTable": [
		"microsoft",
		"MRDL_Unity_PeriodicTable",
		"all"
	],
	"Microsoft.OSConfig": [
		"microsoft",
		"osconfig",
		"all"
	],
	"Microsoft.EventLogExpert": [
		"microsoft",
		"EventLogExpert",
		"stable"
	],
	"Microsoft.Azure.Kubelogin": [
		"Azure",
		"kubelogin",
		"stable"
	],
	"Microsoft.Azure.GuestProxyAgent": [
		"Azure",
		"GuestProxyAgent",
		"stable"
	],
	"Microsoft.DirectX.ShaderCompiler": [
		"microsoft",
		"DirectXShaderCompiler",
		"stable"
	],
	"Microsoft.Azure.StorageExplorer": [
		"microsoft",
		"AzureStorageExplorer",
		"stable"
	]
};

export default defineShard(async () => {
	const out: Record<string, unknown> = {};
	for (const [id, [owner, repo, kind]] of Object.entries(repos)) {
		try {
			const { data } = await githubClient.rest.repos.listReleases({ owner, repo, per_page: 30 });
			const releases = data.filter((r) => !r.draft && (kind === 'all' || r.prerelease === (kind === 'prerelease')));
			out[id] = releases.slice(0, 3).map((r) => ({ tag: r.tag_name, pre: r.prerelease, assets: r.assets.map((a) => a.name) }));
		} catch (error) {
			out[id] = String(error);
		}
	}
	console.log('PROBE-BEGIN');
	console.log(JSON.stringify(out));
	console.log('PROBE-END');
	throw new Error('probe only');
});

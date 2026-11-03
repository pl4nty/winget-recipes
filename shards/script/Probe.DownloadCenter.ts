import { defineShard } from 'anthelion';

const ids: Record<string, number> = {
	"Microsoft.AccessDatabaseEngine2016": 54920,
	"Microsoft.AccountLockoutStatus": 15201,
	"Microsoft.AdministrativeTemplates": 108394,
	"Microsoft.AzureVPNClient": 108598,
	"Microsoft.BuildTools2015": 48159,
	"Microsoft.CLRTypesSQLServer.2019": 100451,
	"Microsoft.CertifiedToolAzureVM": 44299,
	"Microsoft.DTrace": 100441,
	"Microsoft.DataMigrationAssistant": 53595,
	"Microsoft.DebugDiag": 58210,
	"Microsoft.DirectAccessCTST": 41938,
	"Microsoft.DirectX": 35,
	"Microsoft.DotNet.RepairTool": 30135,
	"Microsoft.FRSDiag": 8613,
	"Microsoft.HwpConverter": 36772,
	"Microsoft.HyperlapsePro": 52379,
	"Microsoft.LAPS": 46899,
	"Microsoft.LingeringObjectLiquidator": 56051,
	"Microsoft.MSXML.4": 36292,
	"Microsoft.MakeBingYourSearchEngine": 41702,
	"Microsoft.MixedRealityFeatureTool": 102778,
	"Microsoft.NetMon": 4865,
	"Microsoft.Office.2010.FilterPacks": 17062,
	"Microsoft.OneNoteDiagnostics": 53336,
	"Microsoft.PowerBIReportBuilder": 105942,
	"Microsoft.PrintMetadataTroubleshooter": 105763,
	"Microsoft.ProjectMyScreen": 42536,
	"Microsoft.PurviewInformationProtection": 53018,
	"Microsoft.RMSClient": 38396,
	"Microsoft.SQLServer.2012.NativeClient": 29067,
	"Microsoft.SQLServer.RMLUtilities": 106287,
	"Microsoft.ServerSpeechPlatformRuntime": 27225,
	"Microsoft.SurfaceApp": 105302,
	"Microsoft.SurfaceHubRecoveryTool": 52210,
	"Microsoft.UpdateHealthTools.W10": 103324,
	"Microsoft.UpdateHealthTools.W11-21H2": 103324,
	"Microsoft.UpdateHealthTools": 103324,
	"Microsoft.VCRedist.2005.x64": 26347,
	"Microsoft.VCRedist.2005.x86": 26347,
	"Microsoft.VCRedist.2008.x64": 26368,
	"Microsoft.VCRedist.2008.x86": 26368,
	"Microsoft.VCRedist.2010.x64": 26999,
	"Microsoft.VCRedist.2010.x86": 26999,
	"Microsoft.VCRedist.2012.x86": 30679,
	"Microsoft.VSDotNetLogCollect": 12493,
	"Microsoft.WindowsInstallationAssistant": 108850,
	"Microsoft.XNARedist": 20914,
	"Microsoft.msmpi": 105289
};

export default defineShard(async () => {
	const out: Record<string, unknown> = {};
	for (const [id, dlc] of Object.entries(ids)) {
		try {
			const html = await fetch(`https://www.microsoft.com/download/details.aspx?id=${dlc}`).then((r) => r.text());
			const json = html.match(/<script>window\.__DLCDetails__=(\{.+?\})<\/script>/is)?.[1];
			out[id] = json ? JSON.parse(json).dlcDetailsView.downloadFile.map((f: { name: string; version: string; url: string }) => [f.name, f.version, f.url]) : 'no details';
		} catch (error) {
			out[id] = String(error);
		}
	}
	console.log('PROBE-BEGIN');
	console.log(JSON.stringify(out));
	console.log('PROBE-END');
	throw new Error('probe only');
});

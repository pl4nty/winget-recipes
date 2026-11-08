import { defineShard } from 'anthelion';
const URLS: string[] = ["https://aka.ms/TunnelsCliDownload/win-x64", "https://aka.ms/fslogix_download", "https://aka.ms/fslogix/download", "https://aka.ms/GetPCHealthCheckApp", "https://aka.ms/AzureConnectedMachineAgent", "https://aka.ms/azdata-msi", "https://aka.ms/azdata", "https://api.nuget.org/v3-flatcontainer/microsoft.visualstudio.slngen.tool/index.json", "https://update.code.visualstudio.com/api/update/win32-arm64/insider/latest", "https://update.code.visualstudio.com/latest/win32-arm64/insider", "https://www.farmanager.com/download.php", "https://www.farmanager.com/nightly.php", "https://aka.ms/msmmrhostinstaller", "https://aka.ms/MsMMRHostInstaller", "https://aka.ms/ServiceFabricRuntime", "https://download.sftpgo.com/windows/", "https://www.copytrans.net/copytransstudio/", "https://studio-binaries.s3.us-west-2.amazonaws.com/", "https://d.barracuda.com/SEA/", "https://files.creative.com/creative/bin/apps/swureleases/win/creativeapp/release/", "https://software.faithlife.com/api/products/logos/latest", "https://www.logos.com/install", "https://downloads.logoscdn.com/LBS9/Installer/", "https://aka.ms/aspire/cli/win-x64", "https://aka.ms/dotnet/9/aspire-cli-win-x64.zip", "https://intstreamreleases.z22.web.core.windows.net/", "https://www.kerio.com/support/kerio-connect", "https://aka.ms/mkc", "https://aka.ms/ssis/vs2022", "https://marketplace.visualstudio.com/items?itemName=SSIS.MicrosoftDataToolsIntegrationServices", "https://download.lenovo.com/pccbbs/thinkvantage_en/metroapps/Vantage/", "https://www.gigabyte.com/Support/Utility", "https://aka.ms/win32-content-prep-tool"];
export default defineShard(async () => {
	await Promise.all(URLS.map(async (url) => {
		const out: Record<string, unknown> = { url };
		try {
			const r = await fetch(url, { redirect: 'manual', signal: AbortSignal.timeout(15_000) });
			out.status = r.status; out.location = r.headers.get('location'); await r.body?.cancel();
			const g = await fetch(url, { signal: AbortSignal.timeout(20_000) });
			out.final = g.url; out.finalStatus = g.status; out.etag = g.headers.get('etag');
			const t = await g.text(); out.len = t.length;
			out.snippets = [...t.matchAll(/[\w./:%+-]*(?:\.exe|\.msi|\.zip|\.nupkg)\b[^"'<\s]*/gi)].map((m) => m[0]).slice(0, 15);
			if (t.length < 3000) out.body = t;
		} catch (error) { out.error = String(error); }
		console.log(`PROBE ${JSON.stringify(out)}`);
	}));
	throw new Error('probe finished');
});

import { defineShard } from 'anthelion';
import { match } from 'anthelion/helpers';
import { latestUpstreamVersion } from '../lib/winget.ts';

// The update service only answers with a release newer than the version sent.
export default defineShard(async () => {
	const current = await latestUpstreamVersion('Veeam.VeeamAgent');
	const { result } = (await fetch('https://agents.butler.veeam.com/json-rpc.php', {
		method: 'POST',
		body: JSON.stringify({ id: 1, method: 'CheckForUpdates', params: { ProductName: 'AgentWindows', Version: current } }),
	}).then((response) => response.json())) as { result: { status: string; data?: string } };
	if (result.status === 'NoUpdates' || !result.data) throw new Error(`No update after ${current}`);
	const xml = Buffer.from(result.data, 'base64').toString();
	const {
		groups: [agent],
	} = match(xml, /<AgentWindows\b([^>]*)>/);
	const attribute = (name: string) => match(agent, new RegExp(`\\b${name}="([^"]+)"`)).groups[0];
	return { version: attribute('releaseFileVersion'), urls: () => [attribute('Url')] };
});

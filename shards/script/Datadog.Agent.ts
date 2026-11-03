import { defineShard } from 'anthelion';
import { compareVersions } from 'anthelion/helpers';

type Installers = Record<string, Record<string, { url: string }>>;

// Datadog's Windows installer index keys releases as 7.85.0-1; the package uses 7.85.0.1.
export default defineShard(async () => {
	const { 'datadog-agent': agent } = (await fetch(
		'https://s3.amazonaws.com/ddagent-windows-stable/installers_v2.json',
	).then((response) => response.json())) as { 'datadog-agent': Installers };
	const [key, installers] = Object.entries(agent)
		.filter(([key, installers]) => /^\d+\.\d+\.\d+-\d+$/.test(key) && installers.x86_64?.url)
		.sort(([a], [b]) => compareVersions(a.replace('-', '.'), b.replace('-', '.')))
		.at(-1)!;

	return {
		version: key.replace('-', '.'),
		urls: () => [installers.x86_64!.url],
		releaseNotes: { source: 'github', owner: 'DataDog', repo: 'datadog-agent', tag: key.split('-')[0] },
	};
});

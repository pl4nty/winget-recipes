import { glob, mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { basename, dirname, join } from 'node:path';

import { $ } from 'bun';

const TSV = 'dead-versions.tsv';
const CONCURRENCY = 64;
const HEADERS = { 'User-Agent': 'Microsoft-Delivery-Optimization/10.1', DNT: '1', 'Sec-GPC': '1' };
const DEAD = new Set([404, 410]);

const dir = await mkdtemp(join(tmpdir(), 'winget-pkgs-'));
await $`git clone --quiet --depth 1 --filter=blob:none --sparse https://github.com/microsoft/winget-pkgs.git ${dir}`;
await $`git -C ${dir} sparse-checkout set --no-cone ${['/manifests/**/*.installer.yaml', '/fonts/**/*.installer.yaml']}`.quiet();

const versions: { id: string; version: string; font: boolean; urls: string[] }[] = [];
for await (const path of glob('{manifests,fonts}/**/*.installer.yaml', { cwd: dir })) {
	const manifest = Bun.YAML.parse(await readFile(join(dir, path), 'utf8')) as Record<string, any>;
	const urls = [manifest.InstallerUrl, ...(manifest.Installers ?? []).map((i: any) => i.InstallerUrl)];
	versions.push({
		id: basename(path, '.installer.yaml'),
		version: basename(dirname(path)),
		font: path.startsWith('fonts/'),
		urls: [...new Set(urls.filter(Boolean) as string[])],
	});
}

async function status(url: string) {
	for (const method of ['HEAD', 'GET']) {
		try {
			const response = await fetch(url, {
				method,
				headers: method === 'GET' ? { ...HEADERS, Range: 'bytes=0-0' } : HEADERS,
				signal: AbortSignal.timeout(30_000),
			});
			await response.body?.cancel();
			if (method === 'GET' || response.ok) return String(response.status);
		} catch (error) {
			if (method === 'GET') return `error: ${(error as Error).name}`;
		}
	}
	return 'unreachable';
}

const statuses = new Map<string, string>();
const queue = [...new Set(versions.flatMap((v) => v.urls))];
await Promise.all(
	Array.from({ length: CONCURRENCY }, async () => {
		for (let url; (url = queue.pop()); ) {
			statuses.set(url, await status(url));
			if (statuses.size % 10_000 === 0) console.error(`${statuses.size}/${statuses.size + queue.length} URLs`);
		}
	}),
);

const isDead = (v: (typeof versions)[number]) =>
	v.urls.length > 0 && v.urls.every((url) => DEAD.has(Number(statuses.get(url))));
const live = new Set(versions.filter((v) => !isDead(v)).map((v) => v.id.toLowerCase()));
const dead = versions
	.filter(isDead)
	.sort((a, b) => a.id.localeCompare(b.id) || a.version.localeCompare(b.version))
	.map((v) =>
		[
			v.id,
			v.version,
			v.font,
			!live.has(v.id.toLowerCase()),
			v.urls.map((url) => `${statuses.get(url)} ${url}`).join(' '),
		].join('\t'),
	);
await writeFile(TSV, ['PackageIdentifier\tPackageVersion\tFont\tLastVersion\tUrls', ...dead].join('\n') + '\n');

const counts = Map.groupBy(statuses.values(), (s) => s.replace(/^(\d)\d\d$/, '$1xx'));
console.log(
	`${versions.length} versions, ${statuses.size} URLs, ${dead.length} dead versions\n` +
		[...counts].map(([s, n]) => `${s}: ${n.length}`).join('\n'),
);

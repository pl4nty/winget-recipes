import { glob, mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { basename, dirname, join } from 'node:path';

import { $ } from 'bun';

const CSV = 'maintainers.csv';

async function checkout(repo: string, paths: string[]) {
	const dir = await mkdtemp(join(tmpdir(), 'maintainers-'));
	await $`git clone --quiet --depth 1 --filter=blob:none --sparse https://github.com/${repo}.git ${dir}`;
	await $`git -C ${dir} sparse-checkout set --no-cone ${paths}`.quiet();
	return dir;
}

const files = (cwd: string, pattern: string) => Array.fromAsync(glob(pattern, { cwd }));

async function dumplings() {
	const dir = await checkout('SpecterShell/Dumplings', [
		'/Tasks/*/Config.yaml',
		'/Tasks/*/Script.ps1',
	]);
	const ids: string[] = [];
	for (const path of await files(dir, 'Tasks/*/Config.yaml')) {
		const config = Bun.YAML.parse(await readFile(join(dir, path), 'utf8')) as Record<string, any>;
		const script = await readFile(join(dir, dirname(path), 'Script.ps1'), 'utf8').catch(() => '');
		if (
			config.Skip ||
			config.CheckVersionOnly ||
			!/\$this\.(Submit|CompleteInstallerUpdates)\(/.test(script)
		)
			continue;
		ids.push(
			...[
				config.WinGetIdentifier,
				config.WinGetIdentifierModule,
				...Object.values(config.WinGetIdentifierModules ?? {}),
			].filter(Boolean),
		);
		// Mozilla tasks also submit <Id>.<locale> for each entry of $Locales ('multi' is <Id>.MSIX).
		const locales = /^\$Locales = @\(([^)]*)\)/m.exec(script)?.[1];
		if (locales && script.includes('"${WinGetIdentifierPrefix}.${Locale}"'))
			for (const [, locale] of locales.matchAll(/'([^']+)'/g))
				if (locale !== 'en-US') ids.push(`${config.WinGetIdentifier}.${locale === 'multi' ? 'MSIX' : locale}`);
	}
	ids.push('BtbN.FFmpeg.*');
	return ids;
}

async function shards(dir: string) {
	return (await files(dir, 'shards/{json,script}/*.{json,ts}')).map((path) =>
		basename(path).replace(/\.(json|ts)$/, ''),
	);
}

async function anthelion() {
	return shards(await checkout('UnownPlain/anthelion', ['/shards/']));
}

async function b0t() {
	const dir = await checkout('b0t-at/winget-pkgs-updates', [
		'/.github/workflows-data/',
		'/.github/workflows/update-script-packages.yml',
	]);
	const ids: string[] = [];
	for (const path of await files(dir, '.github/workflows-data/*.packages.json')) {
		ids.push(
			...JSON.parse(await readFile(join(dir, path), 'utf8')).map((p: { id: string }) => p.id),
		);
	}
	const workflow = await readFile(
		join(dir, '.github/workflows/update-script-packages.yml'),
		'utf8',
	);
	ids.push(...[...workflow.matchAll(/^\s*- PackageName: "([^"]+)"/gm)].map(([, id]) => id!));
	return ids;
}

// A winget-pkgs .package file reserves its folder for its owners, so `<folder Id>.*` covers the folder Id too.
async function owners() {
	const dir = await checkout('microsoft/winget-pkgs', ['/manifests/**/.package']);
	const ids: Record<string, string[]> = {};
	for (const path of await files(dir, 'manifests/**/.package')) {
		const id = dirname(path).split('/').slice(2).join('.');
		for (const { login } of JSON.parse(await readFile(join(dir, path), 'utf8')).owners)
			(ids[login] ??= []).push(`${id}.*`);
	}
	return ids;
}

const bots = {
	...Object.fromEntries(Object.entries(await owners()).map(([login, ids]) => [login, async () => ids])),
	spectopo: dumplings,
	UnownBot: anthelion,
	'damn-good-b0t': b0t,
	[process.env.GITHUB_REPOSITORY_OWNER ?? 'pl4nty']: () => shards('.'),
};

const rows = new Map<string, { id: string; maintainers: Set<string> }>();
const row = (id: string) => {
	const key = id.toLowerCase();
	if (!rows.has(key)) rows.set(key, { id, maintainers: new Set() });
	return rows.get(key)!;
};

await Promise.all(
	Object.entries(bots).map(async ([bot, list]) => {
		for (const id of await list()) row(id).maintainers.add(bot);
	}),
);

const previous = await readFile(CSV, 'utf8').catch(() => '');
for (const line of previous.split('\n').slice(1)) {
	const [id, maintainers = ''] = line.trim().split(',');
	for (const login of maintainers.split(';')) {
		if (id && login && !(login in bots)) row(id).maintainers.add(login);
	}
}

const lines = [...rows.values()]
	.sort((a, b) => a.id.toLowerCase().localeCompare(b.id.toLowerCase()))
	.map((r) => [r.id, [...r.maintainers].sort().join(';')].join(','));
await writeFile(CSV, ['PackageIdentifier,Maintainers', ...lines].join('\n') + '\n');

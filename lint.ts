import { glob, mkdtemp, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { basename, dirname, join } from 'node:path';

import { $ } from 'bun';

// `bun lint.ts` checks every shard. With --dry-run it also compares the manifests that
// `bun test:shard --dry-run` lists in the step summary with the latest winget-pkgs manifests,
// so it must run in the same step.
type Report = (file: string, message: string) => void;
type Rule = (shards: string[], report: Report) => Promise<void>;

const id = (shard: string) => basename(shard).replace(/\.(json|ts)$/, '');

// Another bot already submits these packages, so a shard here would race it.
const maintained: Rule = async (shards, report) => {
	const rows = (await readFile('maintainers.csv', 'utf8')).trim().split('\n').slice(1);
	const maintainers = new Map(rows.map((row) => [row.split(',')[0]!.toLowerCase(), row.split(',')[1] ?? '']));
	for (const shard of shards) {
		const others = (maintainers.get(id(shard).toLowerCase()) ?? '')
			.split(';')
			.filter((login) => login && login !== process.env.GITHUB_REPOSITORY_OWNER);
		if (others.length) report(shard, `package is maintained by ${others.join(', ')}`);
	}
};

// Shard `urls` replace the URLs these strategies resolve, so a literal URL reuses the old installer.
const URL_STRATEGIES = new Set(['appinstaller', 'electron-builder', 'ms-download-center', 'redirect-match', 'tauri', 'todesktop']);
const shardUrls: Rule = async (shards, report) => {
	for (const shard of shards.filter((shard) => shard.endsWith('.json'))) {
		const { strategy = '', github, urls = [] } = JSON.parse(await readFile(shard, 'utf8'));
		const resolves =
			strategy === 'github-release' ? (github?.method ?? 'redirect') !== 'redirect' : URL_STRATEGIES.has(strategy);
		const literal = urls
			.map((entry: string | { url: string }) => (typeof entry === 'string' ? entry : entry.url))
			.some((url: string) => /^https?:\/\//.test(url) && !url.includes('{'));
		if (resolves && literal) report(shard, `shard replaces the ${strategy} strategy URLs with literal URLs`);
	}
};

// Anthelion reads version-state/<PackageIdentifier> before each update and fails when it is missing.
const versionState: Rule = async (shards, report) => {
	for (const shard of shards) {
		const contents = await readFile(shard, 'utf8');
		const state = shard.endsWith('.json') ? 'state' in JSON.parse(contents) : /\bstate\s*(?::|,\s*$|})/m.test(contents);
		if (state && !(await Bun.file(`version-state/${id(shard)}`).exists()))
			report(shard, `shard returns state but version-state/${id(shard)} is missing`);
	}
};

const ROOT = new Set(['PackageIdentifier', 'PackageVersion', 'ManifestType', 'ManifestVersion']);
// komac drops InstallerLocale on update, and shards cannot set it.
const IGNORED = /(^|\.)InstallerLocale$/;

// Counts each field path without array indexes. Root installer fields count once per installer,
// so komac moving a field between the root and the installers is not a drop.
function fields(yaml: string) {
	const manifest = Bun.YAML.parse(yaml) as Record<string, unknown>;
	if (Array.isArray(manifest.Installers)) {
		const shared = Object.entries(manifest).filter(([key]) => !ROOT.has(key) && key !== 'Installers');
		for (const [key] of shared) delete manifest[key];
		manifest.Installers = manifest.Installers.map((installer) => ({ ...Object.fromEntries(shared), ...installer }));
	}
	const counts = new Map<string, number>();
	const walk = (value: unknown, path: string) => {
		if (value && typeof value === 'object') {
			for (const [key, child] of Object.entries(value)) {
				walk(child, Array.isArray(value) ? `${path}[]` : path ? `${path}.${key}` : key);
			}
		} else {
			counts.set(path, (counts.get(path) ?? 0) + 1);
		}
	};
	walk(manifest, '');
	return counts;
}

// winget orders versions part by part: number first, then a part with a suffix sorts below the bare number.
function compareVersions(a: string, b: string) {
	const parts = (version: string) =>
		version.split('.').map((part) => {
			const [, number = '', other = ''] = /^(\d*)(.*)$/.exec(part.trim())!;
			return [Number(number), other] as const;
		});
	const [left, right] = [parts(a), parts(b)];
	for (let i = 0; i < Math.max(left.length, right.length); i++) {
		const [x, xo] = left[i] ?? [0, ''];
		const [y, yo] = right[i] ?? [0, ''];
		if (x !== y) return x - y;
		if (xo !== yo) return !xo ? 1 : !yo ? -1 : xo.localeCompare(yo, undefined, { sensitivity: 'base' });
	}
	return 0;
}

const droppedFields: Rule = async (shards, report) => {
	const summary = await readFile(process.env.GITHUB_STEP_SUMMARY!, 'utf8');
	const generated = new Map(
		[...summary.matchAll(/^#### (.+)\n\n```yaml\n([\s\S]*?)\n```$/gm)].map(([, path, yaml]) => [path!, yaml!]),
	);
	const packages = [...new Set([...generated.keys()].map((path) => dirname(dirname(path))))];
	if (packages.length === 0) return;

	const dir = await mkdtemp(join(tmpdir(), 'lint-'));
	await $`git clone --quiet --depth 1 --filter=blob:none --sparse https://github.com/microsoft/winget-pkgs.git ${dir}`;
	await $`git -C ${dir} sparse-checkout set --no-cone ${packages.map((pkg) => `/${pkg}/*/*.yaml`)}`.quiet();

	for (const pkg of packages) {
		const identifier = pkg.split('/').slice(2).join('.').toLowerCase();
		const shard = shards.find((shard) => id(shard).toLowerCase() === identifier) ?? pkg;
		const paths = await Array.fromAsync(glob(`${pkg}/*/*.yaml`, { cwd: dir }));
		const latest = [...new Set(paths.map((path) => basename(dirname(path))))].sort(compareVersions).at(-1);
		const version = [...generated.keys()].find((path) => path.startsWith(`${pkg}/`))!.split('/').at(-2);
		for (const path of paths.filter((path) => basename(dirname(path)) === latest)) {
			const name = basename(path);
			const before = fields(await readFile(join(dir, path), 'utf8'));
			const yaml = generated.get(`${pkg}/${version}/${name}`);
			const after = yaml === undefined ? new Map<string, number>() : fields(yaml);
			for (const [field, count] of before) {
				const kept = after.get(field) ?? 0;
				if (kept < count && !IGNORED.test(field))
					report(shard, `${name}: dry run drops ${field} (${count} in ${latest}, ${kept} in dry run)`);
			}
		}
	}
};

const rules: Record<string, Rule> = {
	maintained,
	'shard-urls': shardUrls,
	'version-state': versionState,
	...(process.argv.includes('--dry-run') && { 'dropped-fields': droppedFields }),
};

const shards = (await Array.fromAsync(glob('shards/{json,script}/*.{json,ts}'))).sort();
let errors = 0;
for (const [name, rule] of Object.entries(rules)) {
	await rule(shards, (file, message) => {
		errors++;
		console.log(`::error file=${file},title=${name}::${message}`);
	});
}
if (errors > 0) process.exit(1);

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

// Every releaseNotes source sets ReleaseNotesUrl, and github-release installers get GitHub release notes by default.
const releaseNotesUrl: Rule = async (shards, report) => {
	for (const shard of shards) {
		const contents = await readFile(shard, 'utf8');
		const { strategy, releaseNotes } = shard.endsWith('.json') ? JSON.parse(contents) : {};
		const set = shard.endsWith('.json') ? releaseNotes : /\breleaseNotes\s*:/.test(contents);
		if (strategy !== 'github-release' && !set)
			report(shard, 'shard does not set releaseNotes, so manifests have no ReleaseNotesUrl');
	}
};

const githubReleaseNotes: Rule = async (shards, report) => {
	for (const shard of shards.filter((shard) => shard.endsWith('.json'))) {
		const { strategy, github, releaseNotes } = JSON.parse(await readFile(shard, 'utf8'));
		if (strategy !== 'github-release' || releaseNotes?.source !== 'github') continue;
		if (Object.entries(releaseNotes).every(([key, value]) => key === 'source' || github[key] === value))
			report(shard, 'github-release shards get GitHub release notes by default, so remove releaseNotes');
	}
};

const ROOT = new Set(['PackageIdentifier', 'PackageVersion', 'ManifestType', 'ManifestVersion']);
// komac drops InstallerLocale on update, and shards cannot set it.
const IGNORED = /(^|\.)InstallerLocale$/;
// komac writes ReleaseNotesUrl only to the default locale.
const DEFAULT_LOCALE_ONLY = /(^|\.)ReleaseNotesUrl$/;

// Counts each field path without array indexes. Root installer fields count once per installer,
// so komac moving a field between the root and the installers is not a drop.
function fields(yaml: string) {
	const manifest = Bun.YAML.parse(yaml) as Record<string, unknown>;
	if (Array.isArray(manifest.Installers)) {
		const shared = Object.entries(manifest).filter(([key]) => !ROOT.has(key) && key !== 'Installers');
		for (const [key] of shared) delete manifest[key];
		manifest.Installers = manifest.Installers.map((installer) => ({ ...Object.fromEntries(shared), ...installer }));
		// komac leaves out an ARP DisplayVersion that matches PackageVersion, which winget already assumes.
		for (const installer of manifest.Installers as { AppsAndFeaturesEntries?: { DisplayVersion?: unknown }[] }[])
			for (const entry of installer.AppsAndFeaturesEntries ?? [])
				if (String(entry.DisplayVersion) === String(manifest.PackageVersion)) delete entry.DisplayVersion;
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

// Ports winget's Version ordering (src/AppInstallerSharedLib/Versions.cpp).
function compareVersions(a: string, b: string) {
	const parts = (version: string) => {
		const digit = version.search(/\d/);
		const split = version.indexOf('.');
		if (digit >= 0 && (split < 0 || digit < split)) version = version.slice(digit);
		return version.split('.').map((part) => {
			const [, number = '', other = ''] = /^(\d*)(.*)$/.exec(part.trim())!;
			return [Number(number), other.toLowerCase()] as const;
		});
	};
	const [left, right] = [parts(a.trim()), parts(b.trim())];
	for (let i = 0; i < Math.max(left.length, right.length); i++) {
		const [x, xo] = left[i] ?? [0, ''];
		const [y, yo] = right[i] ?? [0, ''];
		if (x !== y) return x - y;
		if (xo !== yo) return !xo ? 1 : !yo ? -1 : xo < yo ? -1 : 1;
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
			const raw = await readFile(join(dir, path), 'utf8');
			const before = fields(raw);
			const defaultLocale = /^ManifestType:\s*defaultLocale\s*$/m.test(raw);
			const yaml = generated.get(`${pkg}/${version}/${name}`);
			const after = yaml === undefined ? new Map<string, number>() : fields(yaml);
			for (const [field, count] of before) {
				const kept = after.get(field) ?? 0;
				if (kept < count && !IGNORED.test(field) && (defaultLocale || !DEFAULT_LOCALE_ONLY.test(field)))
					report(shard, `${name}: dry run drops ${field} (${count} in ${latest}, ${kept} in dry run)`);
			}
		}
	}
};

const rules: Record<string, Rule> = {
	maintained,
	'shard-urls': shardUrls,
	'version-state': versionState,
	'release-notes-url': releaseNotesUrl,
	'github-release-notes': githubReleaseNotes,
	...(process.argv.includes('--dry-run') && { 'dropped-fields': droppedFields }),
};

const WARNINGS = new Set(['release-notes-url']);
const shards = (await Array.fromAsync(glob('shards/{json,script}/*.{json,ts}'))).sort();
let errors = 0;
for (const [name, rule] of Object.entries(rules)) {
	await rule(shards, (file, message) => {
		const level = WARNINGS.has(name) ? 'warning' : 'error';
		if (level === 'error') errors++;
		console.log(`::${level} file=${file},title=${name}::${message}`);
	});
}
if (errors > 0) process.exit(1);

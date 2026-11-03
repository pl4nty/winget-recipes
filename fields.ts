import { appendFile, glob, mkdtemp, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { basename, dirname, join } from 'node:path';

import { compareVersions } from 'anthelion/helpers';
import { $ } from 'bun';

// Fails when a shard dry run drops fields that the latest winget-pkgs manifests have.
// Run in the same step as `bun test:shard --dry-run`, which lists its manifests in the step summary.
const SUMMARY = process.env.GITHUB_STEP_SUMMARY!;
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
		manifest.Installers = manifest.Installers.map((installer) => ({
			...Object.fromEntries(shared),
			...installer,
		}));
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

const generated = new Map(
	[...(await readFile(SUMMARY, 'utf8')).matchAll(/^#### (.+)\n\n```yaml\n([\s\S]*?)\n```$/gm)].map(
		([, path, yaml]) => [path!, yaml!],
	),
);
const packages = [...new Set([...generated.keys()].map((path) => dirname(dirname(path))))];
if (packages.length === 0) process.exit(0);

const dir = await mkdtemp(join(tmpdir(), 'fields-'));
await $`git clone --quiet --depth 1 --filter=blob:none --sparse https://github.com/microsoft/winget-pkgs.git ${dir}`;
await $`git -C ${dir} sparse-checkout set --no-cone ${packages.map((pkg) => `/${pkg}/*/*.yaml`)}`.quiet();

const dropped: string[] = [];
for (const pkg of packages) {
	const paths = await Array.fromAsync(glob(`${pkg}/*/*.yaml`, { cwd: dir }));
	const latest = [...new Set(paths.map((path) => basename(dirname(path))))].sort(compareVersions).at(-1);
	const version = [...generated.keys()].find((path) => path.startsWith(`${pkg}/`))!.split('/').at(-2);
	for (const path of paths.filter((path) => basename(dirname(path)) === latest)) {
		const name = basename(path);
		const before = fields(await readFile(join(dir, path), 'utf8'));
		const yaml = generated.get(`${pkg}/${version}/${name}`);
		const after = yaml === undefined ? new Map<string, number>() : fields(yaml);
		for (const [field, count] of before) {
			if (IGNORED.test(field)) continue;
			const kept = after.get(field) ?? 0;
			if (kept >= count) continue;
			const message = `${name}: ${field} (${count} in ${latest}, ${kept} in dry run)`;
			dropped.push(message);
			console.log(`::error title=Dropped field::${message}`);
		}
	}
}

await appendFile(
	SUMMARY,
	['', '## Dropped Fields', '', ...(dropped.length ? dropped.map((d) => `- ${d}`) : ['None']), ''].join('\n'),
);
if (dropped.length > 0) process.exit(1);

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
			.filter((login) => login && login !== (process.env.GITHUB_REPOSITORY_OWNER ?? 'pl4nty'));
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

// Ports winget-cli's name normalization (src/AppInstallerCommonCore/NameNormalization.cpp, via winget-types),
// which komac uses to leave out an ARP DisplayName that matches the PackageName.
const LEGAL_ENTITY_SUFFIXES = new Set(
	'ab,ad,ag,aps,as,asa,bv,co,cv,doo,ev,ges,gesmbh,gmbh,inc,kg,ks,ps,llc,lp,ltd,ltda,mbh,nv,plc,sl,pty,pvt,sa,sarl,sc,sca,sp,spa,srl,sro,company,corp,corporation,holding,holdings,incorporated,limited,subsidiary'.split(','),
);
const LOCALES = new Set(
	'af-za,am-et,ar-ae,ar-bh,ar-dz,ar-eg,ar-iq,ar-jo,ar-kw,ar-lb,ar-ly,ar-ma,arn-cl,ar-om,ar-qa,ar-sa,ar-sy,ar-tn,ar-ye,as-in,ba-ru,be-by,bg-bg,bn-bd,bn-in,bo-cn,br-fr,ca-es,ca-es-valencia,co-fr,cs-cz,cy-gb,da-dk,de-at,de-ch,de-de,de-li,de-lu,dsb-de,dv-mv,el-gr,en-au,en-bz,en-ca,en-gb,en-ie,en-in,en-jm,en-my,en-nz,en-ph,en-sg,en-tt,en-us,en-za,en-zw,es-ar,es-bo,es-cl,es-co,es-cr,es-do,es-ec,es-es,es-gt,es-hn,es-mx,es-ni,es-pa,es-pe,es-pr,es-py,es-sv,es-us,es-uy,es-ve,et-ee,eu-es,fa-ir,fi-fi,fil-ph,fo-fo,fr-be,fr-ca,fr-ch,fr-fr,fr-lu,fr-mc,fy-nl,ga-ie,gd-db,gl-es,gsw-fr,gu-in,he-il,hi-in,hr-ba,hr-hr,hsb-de,hu-hu,hy-am,id-id,ig-ng,ii-cn,is-is,it-ch,it-it,ja-jp,ka-ge,kk-kz,kl-gl,km-kh,kn-in,kok-in,ko-kr,ky-kg,lb-lu,lo-la,lt-lt,lv-lv,mi-nz,mk-mk,ml-in,mn-mn,moh-ca,mr-in,ms-bn,ms-my,mt-mt,nb-no,ne-np,nl-be,nl-nl,nn-no,nso-za,oc-fr,or-in,pa-in,pl-pl,prs-af,ps-af,pt-br,pt-pt,qut-gt,quz-bo,quz-ec,quz-pe,rm-ch,ro-ro,ru-ru,rw-rw,sah-ru,sa-in,se-fi,se-no,se-se,si-lk,sk-sk,sl-si,sma-no,sma-se,smj-no,smj-se,smn-fi,sms-fi,sq-al,sv-fi,sv-se,sw-ke,syr-sy,ta-in,te-in,th-th,tk-tm,tn-za,tr-tr,tt-ru,ug-cn,uk-ua,ur-pk,vi-vn,wo-sn,xh-za,yo-ng,zh-cn,zh-hk,zh-mo,zh-sg,zh-tw,zu-za,az-cyrl-az,az-latn-az,bs-cyrl-ba,bs-latn-ba,ha-latn-ng,iu-cans-ca,iu-latn-ca,mn-mong-cn,sr-cyrl-ba,sr-cyrl-cs,sr-cyrl-me,sr-cyrl-rs,sr-latn-ba,sr-latn-cs,sr-latn-me,sr-latn-rs,tg-cyrl-tj,tzm-latn-dz,uz-cyrl-uz,uz-latn-uz'.split(','),
);
const ARCHITECTURES = [
	/(?:^|[^\p{L}\p{Nd}])(?<target>(?:64[\\/]32|32[\\/]64)[\p{Pd}\p{Pc}\p{Z}]?BITS?(?:\sEDITION)?)/diu,
	/(?:^|[^\p{L}\p{Nd}])(?<target>X64|AMD64|X86(?:[\p{Pd}\p{Pc}]64))(?:(?<edition>\sEDITION)|\P{Nd}|$)/diu,
	/(?:^|[^\p{L}\p{Nd}])(?<target>64[\p{Pd}\p{Pc}\p{Z}]?BITS?(?:\sEDITION)?)/diu,
	/(?:^|[^\p{L}\p{Nd}])(?<target>X32|X86)(?:(?<edition>\sEDITION)|\P{Nd}|$)/diu,
	/(?:^|[^\p{L}\p{Nd}])(?<target>32[\p{Pd}\p{Pc}\p{Z}]?BITS?(?:\sEDITION)?)/diu,
];
const LOCALE = /(?:^|[^A-Z])(?:(?<valencia>[A-Z]{2,3}(?:-(?:CANS|CYRL|LATN|MONG))?-[A-Z]{2}-VALENCIA)|(?<target>[A-Z]{2,3}(?:-(?:CANS|CYRL|LATN|MONG))?-[A-Z]{2})(?:[^A-Z]|$))/dgiu;
const SAP_PACKAGE = /^(?:[\p{Lu}\p{Nd}]+[._])+[\p{Lu}\p{Nd}]+(?:-(?:\p{Nd}+\.)+\p{Nd}+)(?:-(?:\p{Lu}{2}(?:_\p{Lu}{2})?|CORE))(?:-(?:\p{Lu}{2}|\p{Nd}{2}))$/iu;
const KB_NUMBER = /\((KB\d+)\)/giu;
const VERSION_PREFIX = '(?:V|VER|VERSI(?:O|Ó)N|VERSÃO|VERSIE|WERSJA|BUILD|RELEASE|RC|SP)';
const PREFIX = '(?:P|V|R|VER|VERSI(?:O|Ó)N|VERSÃO|VERSIE|WERSJA|BUILD|RELEASE|RC|SP)';
const CLEANUP = [
	/^(?:ROBLOX\s(?:PLAYER|STUDIO))(?<target>\sFOR\s.*)/diu,
	/^(?:BOMGAR\s(?:JUMP CLIENT|(?:ACCESS|REPRESENTATIVE) CONSOLE|BUTTON)|EMBEDDED CALLBACK)(?<target>\s.*)/diu,
	/(?<target>^\(.*?\))/diu,
	/(?<target>\(\s*\)|\[\s*\]|"\s*")/diu,
	/(?<target>\(CHANGE #\d{1,2} TO [CDEF]:\\(?:.+?\\)*[^\s]*\\?\))/diu,
	/(?<target>\([CDEF]:\\(?:.+?\\)*[^\s]*\\?\))/diu,
	/(?<target>"[CDEF]:\\(?:.+?\\)*[^\s]*\\?")/diu,
	/(?<target>(?:(?:INSTALLED\sAT|IN)\s)?[CDEF]:\\(?:.+?\\)*[^\s]*\\?)/diu,
	new RegExp(`(?:^|[^\\p{L}])(?<target>(?:${VERSION_PREFIX}\\P{L})?\\p{Lu}\\p{Nd}+(?:[\\p{Po}\\p{Pd}\\p{Pc}]\\p{Nd}+)+)`, 'diu'),
	new RegExp(`(?:^|[^\\p{L}])(?<target>${VERSION_PREFIX}\\P{L}?\\p{Nd}+(?:[\\p{Po}\\p{Pd}\\p{Pc}]\\p{Nd}?(?:RC|B|A|R|SP|K)?\\p{Nd}+)+(?:[\\p{Po}\\p{Pd}\\p{Pc}]?[\\p{L}\\p{Nd}]+)*)`, 'diu'),
	/(?<target>\p{Nd}+(?:[\p{Po}\p{Pd}\p{Pc}]\p{Nd}?(?:RC|B|A|R|SP|K)?\p{Nd}+)+(?:[\p{Po}\p{Pd}\p{Pc}]?[\p{L}\p{Nd}]+)*)/diu,
	new RegExp(`(?<target>FOR\\s${PREFIX}(?:\\P{L}|\\P{L}\\p{L})?(?:\\p{Nd}|\\.\\p{Nd})+(?:RC|B|A|R|V|SP)?\\p{Nd}?)`, 'diu'),
	new RegExp(`(?:^|[^\\p{L}])(?<target>${PREFIX}(?:\\P{L}|\\P{L}\\p{L})?(?:\\p{Nd}|\\.\\p{Nd})+(?:RC|B|A|R|V|SP)?\\p{Nd}?)`, 'diu'),
	/(?<target>\sEN\s*$)/diu,
	/(?<target>\([^()]*\)|\[[^[\]]*\])/du,
	/(?<target>\p{Ps}.*\p{Pe}|".*")/du,
	/(?:^|[^\p{L}])(?<target>(?:HTTPS?|FTP):\/\/)/diu,
	/(?<target>^[^\p{L}\p{Nd}]+|[^\p{L}\p{Nd}]+$)/du,
];
const WHITESPACE = /^[ \f\n\r\t\v]+|[ \f\n\r\t\v]+$/g;

function removeAll(expression: RegExp, input: string): [string, boolean] {
	let removed = false;
	for (let match = expression.exec(input); match?.indices?.groups?.target; match = expression.exec(input)) {
		const [start] = match.indices.groups.target;
		const [, end] = match.indices.groups.edition ?? match.indices.groups.target;
		input = input.slice(0, start) + input.slice(end);
		removed = true;
	}
	return [input, removed];
}

function normalizeName(name: string) {
	let result = name.toLowerCase().normalize('NFKC').replace(WHITESPACE, '');
	const at = result.indexOf('@@', 3);
	if (at >= 0) result = result.slice(0, at);
	while (result.length >= 2 && ((result.startsWith('"') && result.endsWith('"')) || (result.startsWith('(') && result.endsWith(')'))))
		result = result.slice(1, -1);
	if (SAP_PACKAGE.test(result)) return result;

	for (const expression of ARCHITECTURES) {
		let removed;
		[result, removed] = removeAll(expression, result);
		if (removed) break;
	}
	for (LOCALE.lastIndex = 0; ; ) {
		const match = LOCALE.exec(result);
		if (!match) break;
		const [start, end] = match.indices!.groups!.valencia ?? match.indices!.groups!.target!;
		if (LOCALES.has(result.slice(start, end))) {
			result = result.slice(0, start) + result.slice(end);
			LOCALE.lastIndex = 0;
		} else LOCALE.lastIndex = end;
	}
	result = result.replace(KB_NUMBER, '$1');
	for (let removed = true; removed; ) {
		removed = false;
		for (const expression of CLEANUP) {
			let changed;
			[result, changed] = removeAll(expression, result);
			removed ||= changed;
		}
	}
	let normalized = '';
	for (const token of result.split(/[^\p{L}\p{Nd}+&]/u).filter((token) => token.replace(WHITESPACE, ''))) {
		if (normalized && LEGAL_ENTITY_SUFFIXES.has(token)) continue;
		normalized += token;
	}
	return normalized.replace(/[^\p{L}\p{Nd}]/gu, '');
}

const DEFAULT_LOCALE = /^ManifestType:\s*defaultLocale\s*$/m;
const ROOT = new Set(['PackageIdentifier', 'PackageVersion', 'ManifestType', 'ManifestVersion']);
// komac drops InstallerLocale on update, and shards cannot set it.
const IGNORED = /(^|\.)InstallerLocale$/;
// komac writes ReleaseNotesUrl only to the default locale.
const DEFAULT_LOCALE_ONLY = /(^|\.)ReleaseNotesUrl$/;

// Counts each field path without array indexes. Root installer fields count once per installer,
// so komac moving a field between the root and the installers is not a drop.
function fields(yaml: string, arp: Record<string, unknown> = {}) {
	const manifest = Bun.YAML.parse(yaml) as Record<string, unknown>;
	if (Array.isArray(manifest.Installers)) {
		const shared = Object.entries(manifest).filter(([key]) => !ROOT.has(key) && key !== 'Installers');
		for (const [key] of shared) delete manifest[key];
		manifest.Installers = manifest.Installers.map((installer) => ({ ...Object.fromEntries(shared), ...installer }));
		// komac leaves out ARP values that match the package (DisplayName after normalization) or the installer type.
		for (const installer of manifest.Installers as Record<string, unknown>[]) {
			const InstallerType = installer.InstallerType === 'zip' ? installer.NestedInstallerType : installer.InstallerType;
			for (const entry of (installer.AppsAndFeaturesEntries ?? []) as Record<string, unknown>[])
				for (const [key, value] of Object.entries({ ...arp, DisplayVersion: manifest.PackageVersion, InstallerType }))
					if (
						value !== undefined &&
						(String(entry[key]) === String(value) ||
							(key === 'DisplayName' && normalizeName(String(entry[key])) === normalizeName(String(value))))
					)
						delete entry[key];
		}
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
		const raws = new Map<string, string>();
		for (const path of paths.filter((path) => basename(dirname(path)) === latest))
			raws.set(basename(path), await readFile(join(dir, path), 'utf8'));
		const yamls = new Map([...raws.keys()].map((name) => [name, generated.get(`${pkg}/${version}/${name}`)]));
		const [beforeArp, afterArp] = [raws, yamls].map((files) => {
			const yaml = [...files.values()].find((yaml) => yaml && DEFAULT_LOCALE.test(yaml));
			const { PackageName, Publisher } = (yaml ? Bun.YAML.parse(yaml) : {}) as Record<string, unknown>;
			return { DisplayName: PackageName, Publisher };
		});
		for (const [name, raw] of raws) {
			const before = fields(raw, beforeArp);
			const defaultLocale = DEFAULT_LOCALE.test(raw);
			const yaml = yamls.get(name);
			const after = yaml === undefined ? new Map<string, number>() : fields(yaml, afterArp);
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

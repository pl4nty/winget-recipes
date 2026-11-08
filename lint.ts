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
// Shards in shards/dry-run only show new versions: Anthelion submits only from shards/json and shards/script.
const dryRunOnly = (shard: string) => shard.startsWith('shards/dry-run/');

// Another bot already submits these packages, so a shard here would race it.
const maintained: Rule = async (shards, report) => {
	const rows = (await readFile('maintainers.csv', 'utf8')).trim().split('\n').slice(1);
	const maintainers = new Map(rows.map((row) => [row.split(',')[0]!.toLowerCase(), row.split(',')[1] ?? '']));
	const wildcards = [...maintainers].filter(([pattern]) => pattern.endsWith('.*'));
	for (const shard of shards.filter((shard) => !dryRunOnly(shard))) {
		const key = id(shard).toLowerCase();
		const others = [
			maintainers.get(key) ?? '',
			...wildcards.filter(([pattern]) => `${key}.`.startsWith(pattern.slice(0, -1))).map(([, logins]) => logins),
		]
			.join(';')
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

// Shards must resolve the latest version, so a version or a static URL must not be fixed.
const hardcodedVersion: Rule = async (shards, report) => {
	for (const shard of shards) {
		const contents = await readFile(shard, 'utf8');
		if (!shard.endsWith('.json')) {
			if (/\bversion\s*:\s*['"`]\d[^'"`{$]*['"`]/.test(contents)) report(shard, 'shard hardcodes its version');
			continue;
		}
		const { strategy, version, state } = JSON.parse(contents);
		if (typeof version === 'string' && !version.includes('{')) report(shard, `shard hardcodes version ${version}`);
		if (strategy === 'static' && !state)
			report(shard, 'static shard without state can only resubmit the version at its URL');
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
		if (strategy !== 'github-release' || !releaseNotes) continue;
		if (
			releaseNotes.source !== 'github' ||
			Object.entries(releaseNotes).every(([key, value]) => key === 'source' || github[key] === value)
		)
			report(shard, 'github-release shards get GitHub release notes by default, so set releaseNotes only for notes from another repo');
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
// komac drops InstallerLocale on update, and shards cannot set it. ReleaseNotes text is optional; ReleaseNotesUrl is not.
const IGNORED = /(^|\.)(InstallerLocale|ReleaseNotes)$/;
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

type DryRun = {
	shard: string;
	latest: string;
	version: string;
	stable: string[];
	raws: Map<string, string>;
	yamls: Map<string, string | undefined>;
};
// Upstream versions keep one format, so a newer version must use the same prefix, separators, zero padding and part count.
// Extra non-zero parts are a new version component, not a format change.
function formatDifference(version: string, latest: string) {
	const [ours, theirs] = [version, latest].map((value) => /^(\D*)(\d+(?:[.+_]\d+)*)/.exec(value));
	if (!ours || !theirs) return;
	if (ours[1]!.toLowerCase() !== theirs[1]!.toLowerCase()) return `prefix "${ours[1]}" instead of "${theirs[1]}"`;
	const [a, b] = [ours[2]!, theirs[2]!].map((core) => core.split(/[.+_]/));
	const [as, bs] = [ours[2]!, theirs[2]!].map((core) => core.replace(/\d/g, ''));
	const shared = Math.min(as.length, bs.length);
	if (as.slice(0, shared) !== bs.slice(0, shared)) return 'different separators';
	const extra = a.length > b.length ? a.slice(b.length) : b.slice(a.length);
	if (extra.length && extra.every((part) => /^0+$/.test(part))) return `${a.length} parts instead of ${b.length}`;
	const padded = (part: string, other: string) => part.length > 1 && part.startsWith('0') && other.length < part.length;
	if (a.some((part, i) => b[i] !== undefined && (padded(part, b[i]) || padded(b[i], part)))) return 'different zero padding';
}

// A package Id ending in one of these is a prerelease channel of the package without it.
const CHANNEL = /\/(?:alpha|beta|canary|dev|experimental|insiders?|nightly|pre|prerelease|preview|rc)$/i;

// Pairs each dry-run manifest from the step summary with the latest winget-pkgs manifest of the same name.
let loaded: Promise<DryRun[]> | undefined;
const dryRuns = (shards: string[]) =>
	(loaded ??= (async () => {
		const summary = await readFile(process.env.GITHUB_STEP_SUMMARY!, 'utf8');
		const generated = new Map(
			[...summary.matchAll(/^#### (.+)\n\n```yaml\n([\s\S]*?)\n```$/gm)].map(([, path, yaml]) => [path!, yaml!]),
		);
		const packages = [...new Set([...generated.keys()].map((path) => dirname(dirname(path))))];
		if (packages.length === 0) return [];

		const dir = await mkdtemp(join(tmpdir(), 'lint-'));
		await $`git clone --quiet --depth 1 --filter=blob:none --sparse https://github.com/microsoft/winget-pkgs.git ${dir}`;
		const parents = packages.filter((pkg) => CHANNEL.test(pkg)).map(dirname);
		await $`git -C ${dir} sparse-checkout set --no-cone ${[...packages, ...parents].map((pkg) => `/${pkg}/*/*.yaml`)}`.quiet();

		return Promise.all(
			packages.map(async (pkg) => {
				const identifier = pkg.split('/').slice(2).join('.').toLowerCase();
				const shard = shards.find((shard) => id(shard).toLowerCase() === identifier) ?? pkg;
				const paths = await Array.fromAsync(glob(`${pkg}/*/*.yaml`, { cwd: dir }));
				const latest = [...new Set(paths.map((path) => basename(dirname(path))))].sort(compareVersions).at(-1)!;
				const version = [...generated.keys()].find((path) => dirname(dirname(path)) === pkg)!.split('/').at(-2)!;
				const stable = CHANNEL.test(pkg)
					? [...new Set((await Array.fromAsync(glob(`${dirname(pkg)}/*/*.yaml`, { cwd: dir }))).map((path) => basename(dirname(path))))]
					: [];
				const raws = new Map<string, string>();
				for (const path of paths.filter((path) => basename(dirname(path)) === latest))
					raws.set(basename(path), await readFile(join(dir, path), 'utf8'));
				const yamls = new Map([...raws.keys()].map((name) => [name, generated.get(`${pkg}/${version}/${name}`)]));
				return { shard, latest, version, stable, raws, yamls };
			}),
		);
	})());

const droppedFields: Rule = async (shards, report) => {
	for (const { shard, latest, raws, yamls } of await dryRuns(shards)) {
		if (dryRunOnly(shard)) continue;
		// komac writes ReleaseNotesUrl for a GitHub release only when the release has notes.
		const { strategy, releaseNotes } = shard.endsWith('.json') ? JSON.parse(await readFile(shard, 'utf8')) : {};
		const githubNotes = strategy === 'github-release' && !releaseNotes;
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
				if (
					kept < count &&
					!IGNORED.test(field) &&
					(defaultLocale || !DEFAULT_LOCALE_ONLY.test(field)) &&
					!(githubNotes && field === 'ReleaseNotesUrl')
				)
					report(shard, `${name}: dry run drops ${field} (${count} in ${latest}, ${kept} in dry run)`);
			}
		}
	}
};

const installers = (yaml: string) => {
	const { Installers = [], ...root } = Bun.YAML.parse(yaml) as Record<string, unknown> & {
		Installers?: Record<string, unknown>[];
	};
	return Installers.map((installer) => ({ ...root, ...installer }));
};
const counts = (values: unknown[]) => values.map(String).sort().join(', ');
// Where the installer comes from: the GitHub repository, else the host without its subdomains.
const source = (url: unknown) => {
	const { hostname, pathname } = new URL(String(url));
	if (hostname === 'github.com') return `github.com/${pathname.split('/').slice(1, 3).join('/')}`.toLowerCase();
	const labels = hostname.split('.');
	return labels.slice(/^(?:ac|co|com|gov|net|org)$/.test(labels.at(-2)!) && labels.at(-1)!.length === 2 ? -3 : -2).join('.');
};
// A download that redirects (a renamed GitHub repository, a vendor CDN) has the same source as each URL it redirects to.
const redirects = async (url: string) => {
	const sources = [source(url)];
	for (let hop = 0; hop < 10; hop++) {
		const response = await fetch(url, { headers: { Range: 'bytes=0-0' }, redirect: 'manual' }).catch(() => undefined);
		await response?.body?.cancel();
		const location = response?.headers.get('location');
		if (!location) break;
		url = new URL(location, url).href;
		sources.push(source(url));
	}
	return sources;
};
// komac detects a more specific type than the one upstream declares.
const REFINED = new Set(['msi>wix', 'wix>msi', 'exe>burn', 'exe>inno', 'exe>msi', 'exe>nullsoft', 'exe>wix']);

// dropped-fields counts fields, so it misses values that change: architectures, scopes, types, sources and versions.
const dryRunValues: Rule = async (shards, report) => {
	for (const { shard, latest, raws, yamls } of await dryRuns(shards)) {
		const name = [...raws.keys()].find((name) => name.endsWith('.installer.yaml'));
		const yaml = name && yamls.get(name);
		if (!name || !yaml) continue;
		const [before, after] = [installers(raws.get(name)!), installers(yaml)];
		const version = String(Bun.YAML.parse(yaml).PackageVersion);
		if (compareVersions(version, latest) < 0) report(shard, `${name}: dry run version ${version} is lower than ${latest}`);
		else if (compareVersions(version, latest) === 0 && version !== latest)
			report(shard, `${name}: dry run version ${version} is ${latest} written differently`);
		else if (/[\s()]/.test(version) && !/[\s()]/.test(latest))
			report(shard, `${name}: dry run version ${version} has spaces or brackets, unlike ${latest}`);
		else if (formatDifference(version, latest))
			report(shard, `${name}: dry run version ${version} is not written like ${latest}: ${formatDifference(version, latest)}`);
		const hashes = new Set(before.map((installer) => installer.InstallerSha256));
		if (version !== latest && after.every((installer) => hashes.has(installer.InstallerSha256)))
			report(shard, `${name}: dry run version ${version} has the same installers as ${latest}`);
		// winget uses PackageVersion when an installer has no DisplayVersion.
		const displayVersions = (list: Record<string, unknown>[], version: string) =>
			list.flatMap(
				(installer) =>
					(installer.AppsAndFeaturesEntries as { DisplayVersion?: unknown }[] | undefined)?.map((entry) =>
						String(entry.DisplayVersion ?? version),
					) ?? [version],
			);
		const used = new Set(displayVersions(before, latest));
		for (const displayVersion of new Set(displayVersions(after, version)))
			if (version !== latest && used.has(displayVersion))
				report(shard, `${name}: dry run DisplayVersion ${displayVersion} is already used by ${latest}`);

		const remaining = after.map((installer) => installer.Architecture);
		const missing = before.filter((installer) => {
			const at = remaining.indexOf(installer.Architecture);
			if (at >= 0) remaining.splice(at, 1);
			return at < 0;
		});
		if (missing.length) {
			const [had, has] = [before, after].map((list) => counts(list.map((installer) => installer.Architecture)));
			report(shard, `${name}: dry run architectures ${has} do not cover ${had} in ${latest}`);
		}
		if (before.length === after.length) {
			const [scopes, scoped] = [before, after].map((list) => counts(list.map((i) => i.Scope)));
			if (before.some((installer) => installer.Scope) && scopes !== scoped)
				report(shard, `${name}: dry run scopes ${scoped} differ from ${scopes} in ${latest}`);
			const [types, typed] = [before, after].map((list) => list.map((i) => String(i.InstallerType)).sort());
			if (types.some((type, i) => type !== typed[i] && !REFINED.has(`${type}>${typed[i]}`)))
				report(shard, `${name}: dry run installer types ${typed.join(', ')} differ from ${types.join(', ')} in ${latest}`);
		}

		const sources = new Set(before.map((installer) => source(installer.InstallerUrl)));
		if (after.some((installer) => !sources.has(source(installer.InstallerUrl))))
			for (const url of new Set(before.map((installer) => String(installer.InstallerUrl))))
				for (const redirect of await redirects(url)) sources.add(redirect);
		for (const url of new Set(after.map((installer) => String(installer.InstallerUrl)))) {
			if (/^https:\/\/github\.com\/[^/]+\/winget-pkgs\//i.test(url))
				report(shard, `${name}: dry run downloads from a winget-pkgs repository: ${url}`);
			else if (!sources.has(source(url)))
				report(shard, `${name}: dry run downloads from ${source(url)}, which ${latest} does not use`);
		}
	}
};

// A prerelease channel should not get a version of its stable package.
const prereleaseChannel: Rule = async (shards, report) => {
	for (const { shard, version, stable } of await dryRuns(shards))
		if (stable.includes(version)) report(shard, `dry run version ${version} is a release of the stable package`);
};

const rules: Record<string, Rule> = process.argv.includes('--dry-run')
	? { 'dropped-fields': droppedFields, 'dry-run-values': dryRunValues, 'prerelease-channel': prereleaseChannel }
	: {
			maintained,
			'shard-urls': shardUrls,
			'hardcoded-version': hardcodedVersion,
			'version-state': versionState,
			'release-notes-url': releaseNotesUrl,
			'github-release-notes': githubReleaseNotes,
		};

const WARNINGS = new Set(['release-notes-url']);
// GitHub shows only 10 warnings per step, so pull requests get warnings for their own shards only.
const changed = process.env.BASE && (await $`git diff --name-only ${process.env.BASE} HEAD`.text()).split('\n');
const shards = (await Array.fromAsync(glob('shards/{json,script,dry-run/json,dry-run/script}/*.{json,ts}'))).sort();
let errors = 0;
for (const [name, rule] of Object.entries(rules)) {
	await rule(shards, (file, message) => {
		const level = WARNINGS.has(name) ? 'warning' : 'error';
		if (level === 'warning' && changed && !changed.includes(file)) return;
		if (level === 'error') errors++;
		// Annotations without a line show only in the check run, not on the pull request's changed files.
		console.log(`::${level} file=${file},line=1,title=${name}::${message}`);
	});
}
if (errors > 0) process.exit(1);

# usage: issues.py < issues.jsonl : prints "id<TAB>refs" for open winget-pkgs new-version Update Requests, keyed by lowercase PackageIdentifier.
# An issue matches its "Current Package Identifier" field, or its title identifier; it is skipped when the two disagree.
import json, re, sys
ident = re.compile(r'[A-Za-z][\w+-]*(?:\.[\w+-]+)+')
def field(body, heading):
    m = re.search(rf'### {heading}[^\n]*\n+(.*?)(?=\n### |\Z)', body or '', re.S)
    return m.group(1).strip().strip('`').strip() if m else ''
refs = {}
for line in sys.stdin:
    i = json.loads(line)
    if field(i['b'], 'What type of update') != 'A new version of an existing package': continue
    f = field(i['b'], 'Current Package Identifier').lower()
    f = f if ident.fullmatch(f) else ''
    t = {x.lower() for x in ident.findall(i['t']) if not re.match(r'v\d', x, re.I)}
    t = {x for x in t if not (f and re.fullmatch(re.escape(f) + r'(\.\d+)+', x))}
    keys = t | {f} - {''}
    if len(keys) == 1: refs.setdefault(keys.pop(), []).append(i['n'])
for k, v in refs.items():
    print(k, ', '.join(f'microsoft/winget-pkgs#{n}' for n in sorted(v)), sep='\t')

#!/bin/bash
# usage: link.sh : appends "Resolves ..." to open "feat: add <Id> shard" PRs for matching open winget-pkgs Update Requests not yet in the body, one edit per $INTERVAL seconds.
set -uo pipefail
R=$GITHUB_REPOSITORY
INTERVAL=${INTERVAL:-20}
gh api --paginate "repos/microsoft/winget-pkgs/issues?labels=Package-Update&state=open&per_page=100" --jq '.[]|select(.pull_request|not)|{n:.number,t:.title,b:.body}' | python3 queue/issues.py > /tmp/issues.tsv
gh api --paginate "repos/$R/pulls?state=open&per_page=100" --jq '.[]|{n:.number,t:.title,b:(.body // "")}' > /tmp/prs.jsonl
python3 - > /tmp/edits.tsv <<'PY'
import base64, json, re
refs = dict(l.rstrip('\n').split('\t') for l in open('/tmp/issues.tsv'))
for l in open('/tmp/prs.jsonl'):
    p = json.loads(l)
    m = re.fullmatch(r'feat: add (\S+) shard', p['t'])
    new = [r for r in refs.get(m[1].lower(), '').split(', ') if r and not re.search(re.escape(r) + r'\b', p['b'])] if m else []
    if new: print(p['n'], base64.b64encode(f"{p['b']}\n\nResolves {', '.join(new)}".encode()).decode(), sep='\t')
PY
echo "$(wc -l < /tmp/edits.tsv) PRs to link"
while IFS=$'\t' read -r num body; do
  for i in 1 2 3 4 5 6; do
    gh api -X PATCH "repos/$R/pulls/$num" -f body="$(base64 -d <<<"$body")" --silent 2>/tmp/err && { echo "#$num"; break; }
    grep -qi 'secondary rate\|abuse' /tmp/err || { cat /tmp/err >&2; break; }
    echo "secondary rate limit, waiting $((600*i))s" >&2; sleep $((600*i))
  done
  sleep "$INTERVAL"
done < /tmp/edits.tsv

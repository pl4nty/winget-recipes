#!/bin/bash
# usage: open.sh : opens a draft PR for each queue/*.tsv line (branch, title, base64 body), one per $INTERVAL seconds, taking the files in turn.
# Skips heads that already have a PR (listed once per run), so a rerun resumes. Backs off on GitHub secondary rate limits. Stops after $BUDGET seconds.
# Appends "Resolves ..." for open winget-pkgs Update Requests that match the PackageIdentifier in the "feat: add <Id> shard" title (fetched once per run).
set -uo pipefail
R=$GITHUB_REPOSITORY
INTERVAL=${INTERVAL:-10}; end=$(( $(date +%s) + ${BUDGET:-20400} ))
python3 - queue/*.tsv > /tmp/order.tsv <<'PY'
import itertools, sys
files = [[l.rstrip('\n') for l in open(p) if l.strip()] for p in sys.argv[1:]]
for row in itertools.zip_longest(*files):
    for l in row:
        if l: print(l)
PY
echo "$(wc -l < /tmp/order.tsv) queued"
call() {
  for i in 1 2 3 4 5 6; do
    out=$(gh api "$@" 2>/tmp/err) && { echo "$out"; return 0; }
    grep -qi 'secondary rate\|abuse' /tmp/err || { cat /tmp/err >&2; return 1; }
    echo "secondary rate limit, waiting $((600*i))s" >&2; sleep $((600*i))
  done
  return 1
}
gh api --paginate "repos/microsoft/winget-pkgs/issues?labels=Package-Update&state=open&per_page=100" --jq '.[]|select(.pull_request|not)|{n:.number,t:.title,b:.body}' | python3 queue/issues.py > /tmp/issues.tsv
echo "$(wc -l < /tmp/issues.tsv) Update Request identifiers"
gh api --paginate "repos/$R/pulls?state=all&per_page=100" --jq '.[].head.ref' | sort -u > /tmp/heads.txt
echo "$(wc -l < /tmp/heads.txt) existing PR heads"
opened=0
while IFS=$'\t' read -r branch title body; do
  [ "$(date +%s)" -lt "$end" ] || { echo "budget used, $opened opened"; exit 0; }
  grep -qxF -- "$branch" /tmp/heads.txt && continue
  echo "$branch" >> /tmp/heads.txt
  gh api "repos/$R/branches/$branch" --silent 2>/dev/null || { echo "missing branch $branch"; continue; }
  body=$(base64 -d <<<"$body")
  id=$(sed -n 's/^feat: add \(.*\) shard$/\1/p' <<<"$title" | tr '[:upper:]' '[:lower:]')
  refs=$(awk -F'\t' -v id="$id" '$1 == id { print $2 }' /tmp/issues.tsv)
  [ -z "$refs" ] || body+=$'\n\n'"Resolves $refs"
  num=$(call "repos/$R/pulls" -f title="$title" -f head="$branch" -f base=main -F draft=true -f body="$body" --jq .number) || { echo "failed $branch"; continue; }
  opened=$((opened+1)); echo "#$num $title"
  sleep "$INTERVAL"
done < /tmp/order.tsv
echo "queue done, $opened opened"

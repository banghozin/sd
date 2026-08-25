#!/usr/bin/env bash
#
# Stage the given paths, then commit and push — but ONLY when the data itself
# actually changed.
#
# Why this exists
# ---------------
# Every fetch script stamps a fresh timestamp into its JSON output:
#
#   fx.json / sectors.json / us-13f.json / kr-insiders.json  → fetchedAt
#   unusual-volume.json / universe.json                      → generatedAt, elapsedSeconds
#   signal-history.json                                      → lastUpdated
#
# That made the file differ on *every* run, so the old
# `git diff --staged --quiet` guard never once skipped a commit. The workflows
# committed overnight, at weekends, and on holidays when not a single price had
# moved — the diff was one timestamp line.
#
# Each of those commits creates a Vercel deployment, and the Hobby plan allows
# 100 deployments per day across the whole account. On 2026-08-25 this repo
# alone produced ~67 in 24 hours; deployments began failing with
# `build-rate-limit` and took a second project on the same account down with
# it.
#
# This script strips the volatile timestamp fields before comparing, so a run
# that fetched identical numbers commits nothing and costs nothing.
#
# Usage: scripts/commit-data.sh "<commit message>" <path>...

#
# Set COMMIT_DATA_DRY_RUN=1 to print the decision without committing or
# pushing. Used to test the guard without touching the repository.

set -uo pipefail

if [ "$#" -lt 2 ]; then
  echo "usage: $0 \"<commit message>\" <path>..." >&2
  exit 2
fi

MESSAGE="$1"
shift

DRY_RUN="${COMMIT_DATA_DRY_RUN:-0}"

git config user.name "github-actions[bot]"
git config user.email "41898282+github-actions[bot]@users.noreply.github.com"

git add -- "$@"

if git diff --staged --quiet; then
  echo "No file changes at all — nothing to commit."
  exit 0
fi

tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT

# Compare two JSON files with the volatile timestamp fields removed and the
# keys sorted. Node rather than jq: every workflow here already sets Node up,
# and unlike jq it is present on a normal developer machine too, so this guard
# can actually be tested before it ships.
cat >"$tmp/same.js" <<'JS'
const fs = require("fs");

// Rewritten on every run whether or not the underlying data moved.
const VOLATILE = ["fetchedAt", "generatedAt", "lastUpdated", "elapsedSeconds"];

const canonical = (value) => {
  if (Array.isArray(value)) return value.map(canonical);
  if (value && typeof value === "object") {
    const out = {};
    for (const key of Object.keys(value).sort()) {
      if (VOLATILE.includes(key)) continue;
      out[key] = canonical(value[key]);
    }
    return out;
  }
  return value;
};

const read = (p) => canonical(JSON.parse(fs.readFileSync(p, "utf8")));

try {
  const [a, b] = process.argv.slice(2);
  process.exit(JSON.stringify(read(a)) === JSON.stringify(read(b)) ? 0 : 1);
} catch {
  // Unparseable on either side: report "different" so the caller commits.
  // Never let a tooling failure silently drop real data.
  process.exit(1);
}
JS

real_change=0

# Process substitution rather than a pipe: a pipe would run the loop in a
# subshell and `real_change` would never escape it.
while IFS= read -r file; do
  [ -n "$file" ] || continue

  # Anything that is not JSON is outside what this guard understands.
  case "$file" in
  *.json) ;;
  *)
    echo "  $file — not JSON, treating as a real change"
    real_change=1
    break
    ;;
  esac

  if ! git show "HEAD:$file" >"$tmp/before.json" 2>/dev/null; then
    echo "  $file — new file"
    real_change=1
    break
  fi

  if node "$tmp/same.js" "$tmp/before.json" "$file"; then
    echo "  $file — only the timestamp moved"
  else
    echo "  $file — data changed"
    real_change=1
    break
  fi
done < <(git diff --staged --name-only)

if [ "$real_change" -eq 0 ]; then
  echo "Only timestamps changed. Not committing, so no deployment is spent."
  git reset -q
  exit 0
fi

if [ "$DRY_RUN" = "1" ]; then
  echo "DRY RUN: would commit \"$MESSAGE\" and push."
  git reset -q
  exit 0
fi

git commit -m "$MESSAGE"

# Five workflows push to main, so races between them are routine.
for attempt in 1 2 3 4 5; do
  if git push; then
    echo "Push succeeded on attempt $attempt"
    exit 0
  fi
  echo "Push failed on attempt $attempt — pulling and retrying..."
  git pull --rebase origin main || exit 1
done

echo "Push failed after 5 attempts"
exit 1

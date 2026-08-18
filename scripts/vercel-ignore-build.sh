#!/usr/bin/env bash
# Vercel "Ignored Build Step" — wired up via `ignoreCommand` in vercel.json.
#
#   exit 0  -> skip the build (no deployment created)
#   exit 1  -> run the build
#
# The workflows in .github/workflows/ push src/data/*.json ~60 times a day.
# Those files are read over HTTP at request time (see src/lib/remote-data.ts),
# so a data-only commit does not need a redeploy — the live deployment picks
# the new numbers up on its next ISR revalidation. Skipping those builds is
# what keeps the project inside the Vercel Hobby deployment quota.

set -u

# Everything except the generated data directory.
CODE_PATHSPEC=(. ':(exclude)src/data')

base=""
if [ -n "${VERCEL_GIT_PREVIOUS_SHA:-}" ] &&
  git cat-file -e "${VERCEL_GIT_PREVIOUS_SHA}^{commit}" 2>/dev/null; then
  # Preferred: diff against whatever is actually deployed right now, so a code
  # change is never missed even if it was skipped over earlier.
  base="$VERCEL_GIT_PREVIOUS_SHA"
elif git rev-parse --verify --quiet "HEAD^" >/dev/null 2>&1; then
  base="HEAD^"
fi

if [ -n "$base" ]; then
  if git diff --quiet "$base" HEAD -- "${CODE_PATHSPEC[@]}"; then
    echo "Only src/data changed since ${base} — skipping build."
    exit 0
  fi
  echo "Code changed since ${base} — building."
  exit 1
fi

# Fallback for shallow clones where no parent commit is available: the data
# workflows always commit with a "chore(data):" subject.
subject="$(git log -1 --pretty=%s 2>/dev/null || echo "")"
case "$subject" in
"chore(data):"*)
  echo "No base commit available; subject is an automated data commit — skipping build."
  exit 0
  ;;
*)
  echo "No base commit available; building to be safe."
  exit 1
  ;;
esac

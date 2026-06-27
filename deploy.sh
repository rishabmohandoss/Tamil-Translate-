#!/usr/bin/env bash
set -e

if [ -z "$ANTHROPIC_API_KEY" ]; then
  echo "Error: ANTHROPIC_API_KEY is not set. Add it to ~/.zshrc and run: source ~/.zshrc"
  exit 1
fi

# Inject key into a temp copy, push, then restore the placeholder
sed "s|__ANTHROPIC_KEY__|$ANTHROPIC_API_KEY|g" index.html > index.html.tmp
mv index.html.tmp index.html

git add index.html
git commit -m "Deploy: inject API key"
git push

# Restore placeholder so source never contains the real key
git checkout HEAD~1 -- index.html
git add index.html
git commit -m "Restore key placeholder"
git push

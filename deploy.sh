#!/usr/bin/env bash
set -e

if [ -z "$ANTHROPIC_API_KEY" ]; then
  echo "Error: ANTHROPIC_API_KEY is not set. Add it to ~/.zshrc and run: source ~/.zshrc"
  exit 1
fi

# Inject key
sed "s|__ANTHROPIC_KEY__|$ANTHROPIC_API_KEY|g" index.html > index.html.tmp
mv index.html.tmp index.html

git add index.html
git commit -m "Deploy: inject API key"

# Try pushing; if GitHub blocks it, extract the unblock URL and wait
push_output=$(git push 2>&1) || true
echo "$push_output"

if echo "$push_output" | grep -q "unblock-secret"; then
  unblock_url=$(echo "$push_output" | grep -o 'https://github.com[^ ]*unblock-secret[^ ]*')
  echo ""
  echo "╔════════════════════════════════════════════════════╗"
  echo "║  GitHub blocked the push. Visit this URL once:    ║"
  echo "╚════════════════════════════════════════════════════╝"
  echo ""
  echo "  $unblock_url"
  echo ""
  read -p "Press Enter after you've approved it in your browser..."
  git push
fi

# Restore placeholder
git checkout HEAD~1 -- index.html
git add index.html
git commit -m "Restore key placeholder"
git push

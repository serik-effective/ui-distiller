#!/usr/bin/env bash
# UI Distiller — install into whichever agent harnesses are present on this machine.
#
#   ./install.sh              install everywhere it finds a home
#   ./install.sh --claude     only Claude Code
#   ./install.sh --codex      only Codex
#   ./install.sh --opencode   only OpenCode (incl. DeepSeek-backed setups)
#   ./install.sh --uninstall  remove what this script installed
#   ./install.sh --dry-run    print actions, change nothing
#
# Nothing is copied: skills are symlinked to this checkout, so `git pull` updates
# every harness at once. Command files are small and are rewritten on each install.

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
NAME="ui-distiller"

DRY=0; UNINSTALL=0; ONLY=""
for a in "$@"; do
  case "$a" in
    --dry-run) DRY=1 ;;
    --uninstall) UNINSTALL=1 ;;
    --claude|--codex|--opencode) ONLY="${ONLY} ${a#--}" ;;
    -h|--help) sed -n '2,14p' "$0"; exit 0 ;;
    *) echo "unknown option: $a" >&2; exit 1 ;;
  esac
done
[ -z "$ONLY" ] && ONLY="claude codex opencode"

say() { printf '%s\n' "$*"; }
run() { if [ "$DRY" = 1 ]; then say "  would: $*"; else eval "$@"; fi; }
wants() { case " $ONLY " in *" $1 "*) return 0 ;; *) return 1 ;; esac; }

link_skill() {          # $1 = skills dir, $2 = harness label
  local dir="$1" label="$2" target="$1/$NAME"
  [ -d "$dir" ] || { say "· $label: no $dir — skipped"; return; }
  if [ "$UNINSTALL" = 1 ]; then
    [ -L "$target" ] && { run "rm '$target'"; say "· $label: removed skill"; } || say "· $label: no skill link"
    return
  fi
  [ -e "$target" ] && [ ! -L "$target" ] && { say "· $label: $target exists and is not a symlink — left alone"; return; }
  run "ln -sfn '$ROOT' '$target'"
  say "· $label: skill → $target"
}

write_command() {       # $1 = file, $2 = label, $3 = frontmatter block
  local file="$1" label="$2" fm="$3" dir
  dir="$(dirname "$file")"
  if [ "$UNINSTALL" = 1 ]; then
    [ -f "$file" ] && { run "rm '$file'"; say "· $label: removed command"; } || say "· $label: no command file"
    return
  fi
  run "mkdir -p '$dir'"
  if [ "$DRY" = 1 ]; then say "  would: write $file"; else
    {
      [ -n "$fm" ] && printf '%s\n' "$fm"
      sed "s|{{TOOLKIT}}|$ROOT|g" "$ROOT/prompts/ui-distiller.md"
    } > "$file"
  fi
  say "· $label: command → $file"
}

say "UI Distiller — $([ "$UNINSTALL" = 1 ] && echo uninstall || echo install)"
say "toolkit: $ROOT"
say ""

# ---- Claude Code: skills dir, plus a slash command --------------------------
if wants claude; then
  link_skill "$HOME/.claude/skills" "Claude Code"
  write_command "$HOME/.claude/commands/$NAME.md" "Claude Code" \
"---
description: Distil a website's most interesting UI patterns into standalone HTML demos
argument-hint: <url> [more urls]
---"
fi

# ---- Codex: same skill format, plus a prompt --------------------------------
if wants codex; then
  link_skill "$HOME/.codex/skills" "Codex"
  write_command "$HOME/.codex/prompts/$NAME.md" "Codex" ""
fi

# ---- OpenCode (any model, DeepSeek included): a command ---------------------
if wants opencode; then
  OC="${XDG_CONFIG_HOME:-$HOME/.config}/opencode"
  if [ -d "$OC" ]; then
    write_command "$OC/command/$NAME.md" "OpenCode" \
"---
description: Distil a website's most interesting UI patterns into standalone HTML demos
---"
  else
    say "· OpenCode: no $OC — skipped"
  fi
fi

say ""
if [ "$UNINSTALL" = 1 ]; then
  say "Done. The checkout itself was not touched."
else
  cat <<EOF
Done.

  Claude Code   /ui-distiller https://example.com
  Codex         /ui-distiller https://example.com
  OpenCode      /ui-distiller https://example.com

Any other harness: paste prompts/ui-distiller.md (replace {{TOOLKIT}} with
$ROOT) or point the agent at $ROOT/SKILL.md.

Optional, for the headless browser pass in harnesses without browser tools:
  npm i -D playwright && npx playwright install chromium
EOF
fi

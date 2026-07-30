#!/usr/bin/env bash
# install.sh — install dependencies for roleplay-manager (Linux/macOS)
# Usage: ./scripts/install.sh
set -euo pipefail

NODE_MIN_MAJOR=22
NODE_MIN_MINOR=12
PNPM_MIN_MAJOR=11
PNPM_MIN_MINOR=15

color_red()    { printf "\033[0;31m%s\033[0m\n" "$*"; }
color_green()  { printf "\033[0;32m%s\033[0m\n" "$*"; }
color_yellow() { printf "\033[0;33m%s\033[0m\n" "$*"; }
color_blue()   { printf "\033[0;34m%s\033[0m\n" "$*"; }

step() { printf "\n"; color_blue "==> $*"; }

version_ge() {
  # version_ge "1.2.3" "1.2.0"  -> returns 0 (true) if 1 >= 2
  local a="$1" b="$2"
  local IFS=.
  local -a va vb
  read -r -a va <<< "$a"
  read -r -a vb <<< "$b"
  for i in 0 1 2; do
    local ai="${va[$i]:-0}"
    local bi="${vb[$i]:-0}"
    if (( ai > bi )); then return 0; fi
    if (( ai < bi )); then return 1; fi
  done
  return 0
}

step "Checking Node.js"
if ! command -v node >/dev/null 2>&1; then
  color_red "Node.js is not installed."
  echo "Please install Node.js >= ${NODE_MIN_MAJOR}.${NODE_MIN_MINOR}.0 from https://nodejs.org/"
  exit 1
fi
NODE_VERSION="$(node -v | sed 's/^v//')"
NODE_MAJOR="$(echo "$NODE_VERSION" | cut -d. -f1)"
NODE_MINOR="$(echo "$NODE_VERSION" | cut -d. -f2)"
if (( NODE_MAJOR < NODE_MIN_MAJOR )) || { (( NODE_MAJOR == NODE_MIN_MAJOR )) && (( NODE_MINOR < NODE_MIN_MINOR )); }; then
  color_red "Node.js $NODE_VERSION is too old. Need >= ${NODE_MIN_MAJOR}.${NODE_MIN_MINOR}.0"
  echo "Please update from https://nodejs.org/"
  exit 1
fi
color_green "Node.js $NODE_VERSION OK"

step "Checking pnpm"
if ! command -v pnpm >/dev/null 2>&1; then
  color_yellow "pnpm not found. Trying to install via corepack..."
  if ! command -v corepack >/dev/null 2>&1; then
    color_red "corepack is not available. Please install pnpm manually: https://pnpm.io/installation"
    exit 1
  fi
  corepack enable
  corepack prepare pnpm@latest --activate
fi
PNPM_VERSION="$(pnpm -v)"
PNPM_MAJOR="$(echo "$PNPM_VERSION" | cut -d. -f1)"
PNPM_MINOR="$(echo "$PNPM_VERSION" | cut -d. -f2)"
if (( PNPM_MAJOR < PNPM_MIN_MAJOR )) || { (( PNPM_MAJOR == PNPM_MIN_MAJOR )) && (( PNPM_MINOR < PNPM_MIN_MINOR )); }; then
  color_yellow "pnpm $PNPM_VERSION is older than recommended. Need >= ${PNPM_MIN_MAJOR}.${PNPM_MIN_MINOR}.1"
  echo "Continuing anyway..."
fi
color_green "pnpm $PNPM_VERSION OK"

step "Installing dependencies"
pnpm install

step "Done"
color_green "Installation complete."
echo
echo "To start the app, run:"
echo "  ./scripts/start.sh"
echo

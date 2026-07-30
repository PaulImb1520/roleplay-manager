#!/usr/bin/env bash
# start.sh — start the roleplay-manager app (Linux/macOS)
# Usage: ./scripts/start.sh
set -euo pipefail

FRONTEND_URL="http://localhost:4321"
FRONTEND_PORT=4321
BACKEND_PORT=3001
STARTUP_DELAY=4  # seconds to wait before opening the browser

color_blue()  { printf "\033[0;34m%s\033[0m\n" "$*"; }
color_green() { printf "\033[0;32m%s\033[0m\n" "$*"; }
color_red()   { printf "\033[0;31m%s\033[0m\n" "$*"; }

cleanup() {
  echo
  color_blue "Shutting down..."
  if [[ -n "${DEV_PID:-}" ]] && kill -0 "$DEV_PID" 2>/dev/null; then
    # Kill the whole process group (turbo + children)
    kill -TERM "-$DEV_PID" 2>/dev/null || kill -TERM "$DEV_PID" 2>/dev/null || true
    wait "$DEV_PID" 2>/dev/null || true
  fi
  color_green "Stopped."
  exit 0
}

trap cleanup INT TERM

# Sanity check: are dependencies installed?
if [[ ! -d node_modules ]] || [[ ! -d packages/backend/node_modules ]]; then
  color_red "Dependencies not installed. Run ./scripts/install.sh first."
  exit 1
fi

# Open the browser after a short delay (so servers have time to come up).
(
  sleep "$STARTUP_DELAY"
  color_blue "Opening $FRONTEND_URL in your browser..."
  if command -v xdg-open >/dev/null 2>&1; then
    xdg-open "$FRONTEND_URL" >/dev/null 2>&1 || true
  elif command -v open >/dev/null 2>&1; then
    open "$FRONTEND_URL" >/dev/null 2>&1 || true
  elif command -v wslview >/dev/null 2>&1; then
    wslview "$FRONTEND_URL" >/dev/null 2>&1 || true
  else
    echo "Could not detect a browser opener. Open $FRONTEND_URL manually."
  fi
) &

color_blue "Starting roleplay-manager (backend on :$BACKEND_PORT, frontend on :$FRONTEND_PORT)..."
color_blue "Press Ctrl+C to stop."
echo

# Start turbo dev in a new process group so we can kill the whole tree.
set -m
pnpm dev &
DEV_PID=$!
set +m

# Wait for the dev process (or the user to Ctrl+C).
wait "$DEV_PID"

#!/usr/bin/env node
/**
 * Architecture & code quality check for the roleplay-manager monorepo.
 *
 * Verifies:
 *   1. Backend hexagonal architecture (domain/application purity)
 *   2. Frontend lib/ agnostic of React/UI/zustand
 *   3. shared/ package purity
 *   4. Frontend file size limit (500 lines)
 *
 * Exits 0 if all checks pass, 1 otherwise.
 *
 * No external dependencies — uses only Node built-ins.
 */

import { readFile, readdir, stat } from "node:fs/promises"
import { join, relative, sep, posix } from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = fileURLToPath(new URL(".", import.meta.url))
const ROOT = join(__dirname, "..")

// --- Config ----------------------------------------------------------------

const SIZE_LIMIT = 500
const FRONTEND_EXT = new Set([".ts", ".tsx", ".astro"])
const TS_EXT = new Set([".ts", ".tsx"])

const FORBIDDEN_FRONTEND_LIB_IMPORTS = [
  "react",
  "@astrojs",
  "lucide-react",
  "@workspace/ui",
  "zustand",
  "next",
]

const FORBIDDEN_SHARED_IMPORTS = [
  "react",
  "@astrojs",
  "lucide-react",
  "@workspace/ui",
  "zustand",
  "next",
  "express",
  "drizzle-orm",
  "axios",
  "better-sqlite3",
]

// Known smell: use cases import error classes from infrastructure.
// Allowed but reported as a warning, not a failure.
const KNOWN_ERROR_HANDLER_IMPORT = "infrastructure/adapters/primary/middlewares/error-handler"

// --- ANSI helpers ----------------------------------------------------------

const useColor = process.stdout.isTTY && !process.env.NO_COLOR
const c = (code) => (useColor ? `\x1b[${code}m` : "")
const RESET = c("0")
const RED = c("31")
const GREEN = c("32")
const YELLOW = c("33")
const BLUE = c("34")
const BOLD = c("1")
const DIM = c("2")

// --- Recursive file walker -------------------------------------------------

async function walk(dir, extFilter, results = []) {
  let entries
  try {
    entries = await readdir(dir, { withFileTypes: true })
  } catch {
    return results
  }
  for (const entry of entries) {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name === "dist" || entry.name === ".turbo") {
        continue
      }
      await walk(full, extFilter, results)
    } else if (entry.isFile()) {
      const dot = entry.name.lastIndexOf(".")
      const ext = dot === -1 ? "" : entry.name.slice(dot)
      if (extFilter.has(ext)) results.push(full)
    }
  }
  return results
}

// --- Imports of a file -----------------------------------------------------

/**
 * Returns the list of "from '...'" import specifiers in a file.
 * Only matches the "from 'specifier'" form (not bare side-effect imports).
 */
function extractImports(content) {
  const re = /from\s+["']([^"']+)["']/g
  const out = []
  let m
  while ((m = re.exec(content)) !== null) out.push(m[1])
  return out
}

// --- Check 1: Frontend file size -------------------------------------------

async function checkFrontendSize() {
  const dir = join(ROOT, "packages", "frontend", "src")
  const files = await walk(dir, FRONTEND_EXT)
  const violations = []

  for (const file of files) {
    const content = await readFile(file, "utf8")
    const lines = content.split("\n").length
    if (lines > SIZE_LIMIT) {
      violations.push({
        file: relative(ROOT, file).split(sep).join(posix.sep),
        lines,
      })
    }
  }

  return {
    name: "Frontend size (max 500 lines)",
    pass: violations.length === 0,
    violations,
  }
}

// --- Check 2: Backend hexagonal --------------------------------------------

async function checkBackendHexagonal() {
  const violations = []
  const warnings = []

  const domainDir = join(ROOT, "packages", "backend", "src", "domain")
  const applicationDir = join(ROOT, "packages", "backend", "src", "application")

  // domain/** must not import from application, infrastructure, or containers
  const domainFiles = await walk(domainDir, TS_EXT)
  for (const file of domainFiles) {
    const content = await readFile(file, "utf8")
    const imports = extractImports(content)
    for (const spec of imports) {
      if (
        spec.includes("/application/") ||
        spec.includes("/infrastructure/") ||
        spec.includes("/containers/")
      ) {
        violations.push({
          file: relative(ROOT, file).split(sep).join(posix.sep),
          rule: "domain-no-external",
          detail: spec,
        })
      }
    }
  }

  // application/** must not import from infrastructure or containers
  // (test files are exempt because they use `as Type` casts for mocks)
  const applicationFiles = await walk(applicationDir, TS_EXT)
  for (const file of applicationFiles) {
    if (file.endsWith(".test.ts")) continue
    const content = await readFile(file, "utf8")
    const imports = extractImports(content)
    for (const spec of imports) {
      if (spec.includes("/containers/")) {
        violations.push({
          file: relative(ROOT, file).split(sep).join(posix.sep),
          rule: "application-no-containers",
          detail: spec,
        })
      } else if (spec.includes("/infrastructure/")) {
        if (spec.includes(KNOWN_ERROR_HANDLER_IMPORT)) {
          warnings.push({
            file: relative(ROOT, file).split(sep).join(posix.sep),
            rule: "application-uses-error-handler",
            detail: spec,
          })
        } else {
          violations.push({
            file: relative(ROOT, file).split(sep).join(posix.sep),
            rule: "application-no-infrastructure",
            detail: spec,
          })
        }
      }
    }
  }

  return {
    name: "Backend hexagonal (domain/application purity)",
    pass: violations.length === 0,
    violations,
    warnings,
  }
}

// --- Check 3: Frontend lib/ agnostic ---------------------------------------

async function checkFrontendAgnostic() {
  const violations = []
  const libDir = join(ROOT, "packages", "frontend", "src", "lib")

  // lib/api/** and lib/format-*.ts must be free of React/UI/zustand
  const files = await walk(libDir, TS_EXT)
  for (const file of files) {
    const rel = relative(libDir, file).split(sep).join(posix.sep)
    const isApi = rel.startsWith("api/")
    const isFormat = rel.startsWith("format-")
    if (!isApi && !isFormat) continue

    const content = await readFile(file, "utf8")
    const imports = extractImports(content)
    for (const spec of imports) {
      for (const forbidden of FORBIDDEN_FRONTEND_LIB_IMPORTS) {
        if (spec === forbidden || spec.startsWith(forbidden + "/")) {
          violations.push({
            file: relative(ROOT, file).split(sep).join(posix.sep),
            rule: "frontend-lib-agnostic",
            detail: `${spec} (forbidden: ${forbidden})`,
          })
        }
      }
    }
  }

  return {
    name: "Frontend lib/ agnostic of React/UI/zustand",
    pass: violations.length === 0,
    violations,
  }
}

// --- Check 4: shared/ package purity ---------------------------------------

async function checkSharedPure() {
  const violations = []
  const sharedDir = join(ROOT, "packages", "shared", "src")
  const files = await walk(sharedDir, TS_EXT)

  for (const file of files) {
    const content = await readFile(file, "utf8")
    const imports = extractImports(content)
    for (const spec of imports) {
      for (const forbidden of FORBIDDEN_SHARED_IMPORTS) {
        if (spec === forbidden || spec.startsWith(forbidden + "/")) {
          violations.push({
            file: relative(ROOT, file).split(sep).join(posix.sep),
            rule: "shared-no-runtime",
            detail: `${spec} (forbidden: ${forbidden})`,
          })
        }
      }
    }
  }

  return {
    name: "shared/ package purity",
    pass: violations.length === 0,
    violations,
  }
}

// --- Reporter --------------------------------------------------------------

function pad(s, n) {
  s = String(s)
  return s.length >= n ? s : s + " ".repeat(n - s.length)
}

function printCheckResult(result) {
  const status = result.pass
    ? `${GREEN}✓${RESET} pass`
    : `${RED}✗${RESET} FAIL`
  console.log(`${BOLD}${result.name}${RESET}  ${status}`)
  if (result.violations && result.violations.length > 0) {
    for (const v of result.violations) {
      const lines = v.lines ? ` (${v.lines} lines)` : ""
      const rule = v.rule ? ` ${DIM}[${v.rule}]${RESET}` : ""
      const detail = v.detail ? ` ${DIM}→${RESET} ${v.detail}` : ""
      console.log(`  ${RED}•${RESET} ${v.file}${lines}${rule}${detail}`)
    }
  }
  if (result.warnings && result.warnings.length > 0) {
    for (const w of result.warnings) {
      const rule = w.rule ? ` ${DIM}[${w.rule}]${RESET}` : ""
      const detail = w.detail ? ` ${DIM}→${RESET} ${w.detail}` : ""
      console.log(`  ${YELLOW}⚠${RESET} ${w.file}${rule}${detail}`)
    }
  }
  console.log()
}

// --- Main ------------------------------------------------------------------

async function main() {
  console.log(`${BOLD}${BLUE}Architecture & code quality check${RESET}`)
  console.log(`${DIM}──────────────────────────────────${RESET}`)
  console.log()

  const checks = await Promise.all([
    checkFrontendSize(),
    checkBackendHexagonal(),
    checkFrontendAgnostic(),
    checkSharedPure(),
  ])

  let totalFailures = 0
  let totalWarnings = 0
  for (const c of checks) {
    printCheckResult(c)
    if (!c.pass) totalFailures += c.violations.length
    totalWarnings += (c.warnings ?? []).length
  }

  const passCount = checks.filter((c) => c.pass).length
  console.log(
    `${BOLD}Summary:${RESET} ${passCount}/${checks.length} checks passed, ` +
      `${totalFailures} failure(s), ${totalWarnings} warning(s)`,
  )

  process.exit(totalFailures > 0 ? 1 : 0)
}

main().catch((err) => {
  console.error(`${RED}Unexpected error:${RESET}`, err)
  process.exit(2)
})

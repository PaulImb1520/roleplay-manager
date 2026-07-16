import { describe, it, expect, vi } from "vitest"
import Database from "better-sqlite3"
import { drizzle, type BetterSQLite3Database } from "drizzle-orm/better-sqlite3"
import { migrate } from "drizzle-orm/better-sqlite3/migrator"
import { resolve } from "node:path"

import * as schema from "../../../infrastructure/adapters/secondary/drizzle/schema"
import { HealthCheckUseCase } from "./health-check.use-case"
import type { Logger } from "../../../domain/ports/logger.port"

const buildInMemoryDb = (): BetterSQLite3Database<typeof schema> => {
  const sqlite = new Database(":memory:")
  sqlite.pragma("foreign_keys = ON")
  const db = drizzle(sqlite, { schema })
  const migrationsFolder = resolve(
    import.meta.dirname,
    "..",
    "..",
    "..",
    "infrastructure",
    "database",
    "migrations",
  )
  migrate(db, { migrationsFolder })
  return db
}

const buildSilentLogger = (): Logger => ({
  debug: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
  child: vi.fn(),
})

describe("HealthCheckUseCase", () => {
  it("devuelve ok cuando la base de datos responde", async () => {
    const db = buildInMemoryDb()
    const logger = buildSilentLogger()
    const useCase = new HealthCheckUseCase(db, logger)

    const result = await useCase.execute()

    expect(result.status).toBe("ok")
    expect(result.database).toBe("reachable")
    expect(result.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/)
    expect(result.uptimeSeconds).toBeGreaterThanOrEqual(0)
  })

  it("devuelve degraded cuando la base de datos falla", async () => {
    const logger = buildSilentLogger()
    const fakeDb = {
      select: () => ({
        from: () => ({
          where: () => {
            throw new Error("db connection lost")
          },
        }),
      }),
    } as unknown as BetterSQLite3Database<typeof schema>

    const useCase = new HealthCheckUseCase(fakeDb, logger)
    const result = await useCase.execute()

    expect(result.status).toBe("degraded")
    expect(result.database).toBe("unreachable")
    expect(logger.warn).toHaveBeenCalled()
  })
})

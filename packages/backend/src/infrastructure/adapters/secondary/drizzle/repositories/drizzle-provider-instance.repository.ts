import { v7 as randomUUIDv7 } from "uuid"
import { eq } from "drizzle-orm"

import type { Database } from "../../../../config/database"
import type {
  CreateProviderInstanceInput,
  UpdateProviderInstanceInput,
  ProviderInstance,
} from "@workspace/shared/types/provider-instance"

import { providerInstances } from "../schema/provider-instances.schema"
import type { ProviderInstanceRepository } from "../../../../../domain/ports/provider-instance.repository"

export class DrizzleProviderInstanceRepository
  implements ProviderInstanceRepository
{
  constructor(private readonly db: Database) {}

  async list(): Promise<ProviderInstance[]> {
    const rows = await this.db
      .select()
      .from(providerInstances)
      .orderBy(providerInstances.name)

    return rows.map(toProviderInstance)
  }

  async findById(id: string): Promise<ProviderInstance | null> {
    const rows = await this.db
      .select()
      .from(providerInstances)
      .where(eq(providerInstances.id, id))
      .limit(1)

    return rows.length > 0 ? toProviderInstance(rows[0]) : null
  }

  async create(input: CreateProviderInstanceInput): Promise<ProviderInstance> {
    const now = new Date()
    const id = randomUUIDv7()

    await this.db.insert(providerInstances).values({
      id,
      kind: input.kind,
      name: input.name,
      url: input.url,
      apiKey: input.apiKey ?? null,
      createdAt: now,
      updatedAt: now,
    })

    return {
      id,
      kind: input.kind,
      name: input.name,
      url: input.url,
      hasApiKey: !!input.apiKey,
      apiKey: input.apiKey ?? null,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    }
  }

  async update(
    id: string,
    input: UpdateProviderInstanceInput,
  ): Promise<ProviderInstance> {
    const now = new Date()
    const values: Record<string, unknown> = { updatedAt: now }

    if (input.name !== undefined) values.name = input.name
    if (input.url !== undefined) values.url = input.url
    if (input.apiKey !== undefined) values.apiKey = input.apiKey

    await this.db
      .update(providerInstances)
      .set(values)
      .where(eq(providerInstances.id, id))

    const updated = await this.findById(id)
    if (!updated) {
      throw new Error(`ProviderInstance '${id}' not found after update`)
    }

    return updated
  }

  async delete(id: string): Promise<void> {
    await this.db
      .delete(providerInstances)
      .where(eq(providerInstances.id, id))
  }
}

function toProviderInstance(
  row: typeof providerInstances.$inferSelect,
): ProviderInstance {
  return {
    id: row.id,
    kind: row.kind,
    name: row.name,
    url: row.url,
    hasApiKey: !!row.apiKey,
    apiKey: row.apiKey ?? null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  }
}

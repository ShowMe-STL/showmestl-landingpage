'use server'

import { revalidatePath } from 'next/cache'
import { requireModerator } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'

const LOOKUP_TABLES = [
  'place_categories',
  'event_categories',
  'dress_codes',
  'neighborhoods',
] as const

export type LookupTable = (typeof LOOKUP_TABLES)[number]

const REVALIDATE_PATHS: Record<LookupTable, string[]> = {
  place_categories: ['/categories'],
  event_categories: ['/categories'],
  dress_codes: ['/dress-codes'],
  neighborhoods: ['/neighborhoods'],
}

function assertValidTable(table: string): asserts table is LookupTable {
  if (!LOOKUP_TABLES.includes(table as LookupTable)) {
    throw new Error(`Unknown lookup table: ${table}`)
  }
}

export async function createLookupEntry(
  table: LookupTable,
  values: { name: string; sort_order?: number },
) {
  assertValidTable(table)
  await requireModerator()

  const name = values.name.trim()
  if (!name) return { error: 'Name is required.' }

  const payload: { name: string; sort_order?: number } = { name }
  if (table !== 'neighborhoods' && values.sort_order !== undefined) {
    payload.sort_order = values.sort_order
  }

  const supabase = createAdminClient()
  // `table` is a dynamic union, so supabase-js can't narrow the insert shape
  // to one specific table; each of the 4 lookup tables' payload is valid at
  // runtime for the table it's sent to.
  const { error } = await supabase.from(table).insert(payload as never)

  if (error) return { error: error.message }
  REVALIDATE_PATHS[table].forEach((p) => revalidatePath(p))
}

export async function updateLookupEntry(
  table: LookupTable,
  id: number,
  values: { name: string; sort_order?: number },
) {
  assertValidTable(table)
  await requireModerator()

  const name = values.name.trim()
  if (!name) return { error: 'Name is required.' }

  const payload: { name: string; sort_order?: number } = { name }
  if (table !== 'neighborhoods' && values.sort_order !== undefined) {
    payload.sort_order = values.sort_order
  }

  const supabase = createAdminClient()
  const { error } = await supabase
    .from(table)
    .update(payload as never)
    .eq('id', id)

  if (error) return { error: error.message }
  REVALIDATE_PATHS[table].forEach((p) => revalidatePath(p))
}

export async function deleteLookupEntry(table: LookupTable, id: number) {
  assertValidTable(table)
  await requireModerator()

  const supabase = createAdminClient()
  const { error } = await supabase.from(table).delete().eq('id', id)

  if (error) return { error: error.message }
  REVALIDATE_PATHS[table].forEach((p) => revalidatePath(p))
}

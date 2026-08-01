// src/lib/supabase.unified.ts
// PATRÓN DEFINITIVO Fase 5 — UNA sola instancia de cliente (una sola sesión de Auth),
// con selección DINÁMICA de esquema vía supabase-js v2 `.schema()`.
//
// Por qué: el patrón anterior creaba DOS clientes (`supabase` gym + `supabasePublic` public),
// lo que dispara "Multiple GoTrueClient instances detected". Aquí hay UN cliente `db` dueño de
// la sesión; los query-builders por esquema se derivan con `.schema()` (misma sesión).
//
// ⚠ IMPORTANTE (supabase-js v2): `db.schema("gym")` devuelve un builder PostgREST con SOLO
//   `.from()` y `.rpc()`. NO expone `.auth` ni `.storage`. Para esos usa `auth` / `storage`
//   (derivados del cliente completo `db`). Ver tabla de migración en FASE5_CONSUMERS_PLAN.md.

import { createClient } from "@supabase/supabase-js"
import type { Database } from "./database.types" // requerido: `supabase gen types … > src/lib/database.types.ts`

const url  = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ""
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ""
if (!url || !anon) {
  throw new Error(
    "Supabase no configurado: define NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY.",
  )
}

// Única instancia. Dueña de la sesión (Auth). Esquema por defecto: public.
// NO crear más `createClient` en la app.
export const db = createClient<Database>(url, anon, {
  auth: {
    storageKey: "sb-gymsos-auth",
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})

// Sesión y almacenamiento — SIEMPRE desde el cliente completo (los builders .schema() no los tienen).
export const auth    = db.auth
export const storage = db.storage

// Query-builders por esquema sobre la MISMA sesión.
//   gymDb.from("usuarios") | publicDb.from("codes") | ongDb.from("access_links")
export const gymDb    = db.schema("gym")
export const publicDb = db.schema("public")
export const ongDb    = db.schema("ong")

// Selección de esquema en runtime.
export type AppSchema = "gym" | "public" | "ong"
export const dbFor = (schema: AppSchema) => db.schema(schema)

// RPC: las funciones viven en public → `db.rpc("fn_x", args)` o `publicDb.rpc(...)`.
//      Para RPC de otro esquema: `db.schema("gym").rpc("fn_x", args)`.

// ── Compatibilidad retro (DEPRECADO) ──────────────────────────────────────────────────
// Solo cubren `.from()` y `.rpc()`. NO tienen `.auth` ni `.storage` (usa `auth`/`storage`).
/** @deprecated usa `gymDb` (y `auth`/`storage` para sesión/archivos) */
export const supabase = gymDb
/** @deprecated usa `publicDb` */
export const supabasePublic = publicDb

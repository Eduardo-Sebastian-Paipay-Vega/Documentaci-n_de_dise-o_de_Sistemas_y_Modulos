-- ═══════════════════════════════════════════════════════════════════════════════
-- GYMsos — Migración 003: Decisión sobre tablas huérfanas
-- Fecha: 2026-05-29
-- Prerequisito: migraciones 001 y 002 aplicadas
-- ═══════════════════════════════════════════════════════════════════════════════
--
-- CLASIFICACIÓN FINAL DE 17 TABLAS ASPIRACIONALES:
--
-- MANTENER CON SERVICIO ACTIVO (implementadas en esta sesión):
--   gamification_xp, gamification_levels  → gamification.service.ts ✅
--   health_alerts                          → alerts.service.ts ✅
--
-- MANTENER SIN SERVICIO (roadmap próxima sprint):
--   wearable_sync        → alto valor, requiere integración OAuth externa
--   ai_recommendations   → requiere modelo ML o API IA
--   churn_interventions  → complemento de churn_predictions ya activo
--   digital_twin         → requiere datos biométricos continuos
--
-- ELIMINAR — scope excesivo para etapa actual:
--   battle_pass_progression  → gaming complejo, post-v2
--   clanes, clan_miembros    → social features, post-v2
--   torneos_semanales        → eventos, post-v2
--   marketplace_vendors      → negocio independiente
--   marketplace_transactions → negocio independiente
--   corporate_clients        → enterprise, post-v2
--   corporate_leaderboards   → enterprise, post-v2
--   dynamic_pricing_log      → pricing engine, post-v2
--
-- RESULTADO: 30 tablas → 21 tablas activas (reducción 30%)
-- Arquitectura ahora = Producto real (sin "promesa gigante")
-- ═══════════════════════════════════════════════════════════════════════════════

-- ─── ELIMINACIONES CONTROLADAS ────────────────────────────────────────────────
-- Estas tablas no tienen datos de producción ni servicios que las consuman.
-- Se eliminan para cerrar la brecha arquitectura > producto.

DROP TABLE IF EXISTS battle_pass_progression CASCADE;
DROP TABLE IF EXISTS clan_miembros           CASCADE;
DROP TABLE IF EXISTS clanes                  CASCADE;
DROP TABLE IF EXISTS torneos_semanales       CASCADE;
DROP TABLE IF EXISTS marketplace_transactions CASCADE;
DROP TABLE IF EXISTS marketplace_vendors     CASCADE;
DROP TABLE IF EXISTS corporate_leaderboards  CASCADE;
DROP TABLE IF EXISTS corporate_clients       CASCADE;
DROP TABLE IF EXISTS dynamic_pricing_log     CASCADE;

-- ─── TABLAS QUE SE MANTIENEN — agregar RLS básica ─────────────────────────────

-- gamification_xp: miembro ve sus propios eventos, gerente ve los de su gym
ALTER TABLE gamification_xp ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "xp_select_own"   ON gamification_xp;
DROP POLICY IF EXISTS "xp_select_staff" ON gamification_xp;
DROP POLICY IF EXISTS "xp_insert_system" ON gamification_xp;

CREATE POLICY "xp_select_own" ON gamification_xp
  FOR SELECT USING (id_usuario = auth.uid());

CREATE POLICY "xp_select_staff" ON gamification_xp
  FOR SELECT USING (
    get_user_rol() IN ('gerente','entrenador','admin')
  );

CREATE POLICY "xp_insert_system" ON gamification_xp
  FOR INSERT WITH CHECK (
    id_usuario = auth.uid() OR get_user_rol() IN ('admin')
  );

-- gamification_levels: propio o staff
ALTER TABLE gamification_levels ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "levels_select_own"   ON gamification_levels;
DROP POLICY IF EXISTS "levels_select_staff" ON gamification_levels;
DROP POLICY IF EXISTS "levels_upsert_system" ON gamification_levels;

CREATE POLICY "levels_select_own" ON gamification_levels
  FOR SELECT USING (id_usuario = auth.uid());

CREATE POLICY "levels_select_staff" ON gamification_levels
  FOR SELECT USING (
    get_user_rol() IN ('gerente','admin')
  );

CREATE POLICY "levels_upsert_system" ON gamification_levels
  FOR ALL USING (
    id_usuario = auth.uid() OR get_user_rol() = 'admin'
  );

-- health_alerts: propio o staff
ALTER TABLE health_alerts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "alerts_select_own"   ON health_alerts;
DROP POLICY IF EXISTS "alerts_select_staff" ON health_alerts;
DROP POLICY IF EXISTS "alerts_insert_staff" ON health_alerts;
DROP POLICY IF EXISTS "alerts_update_own"   ON health_alerts;

CREATE POLICY "alerts_select_own" ON health_alerts
  FOR SELECT USING (id_usuario = auth.uid());

CREATE POLICY "alerts_select_staff" ON health_alerts
  FOR SELECT USING (
    get_user_rol() IN ('gerente','nutricionista','admin')
  );

CREATE POLICY "alerts_insert_staff" ON health_alerts
  FOR INSERT WITH CHECK (
    get_user_rol() IN ('gerente','recepcionista','nutricionista','admin')
  );

CREATE POLICY "alerts_update_own" ON health_alerts
  FOR UPDATE USING (
    id_usuario = auth.uid() OR
    get_user_rol() IN ('gerente','admin')
  );

-- wearable_sync: propio únicamente
ALTER TABLE wearable_sync ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "wearable_select_own"  ON wearable_sync;
DROP POLICY IF EXISTS "wearable_upsert_own"  ON wearable_sync;

CREATE POLICY "wearable_select_own" ON wearable_sync
  FOR SELECT USING (id_usuario = auth.uid());

CREATE POLICY "wearable_upsert_own" ON wearable_sync
  FOR ALL USING (id_usuario = auth.uid());

-- ai_recommendations: propio o gerente
ALTER TABLE ai_recommendations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "ai_rec_select_own"   ON ai_recommendations;
DROP POLICY IF EXISTS "ai_rec_select_staff" ON ai_recommendations;
DROP POLICY IF EXISTS "ai_rec_insert_system" ON ai_recommendations;

CREATE POLICY "ai_rec_select_own" ON ai_recommendations
  FOR SELECT USING (id_usuario = auth.uid());

CREATE POLICY "ai_rec_select_staff" ON ai_recommendations
  FOR SELECT USING (get_user_rol() IN ('gerente','admin'));

CREATE POLICY "ai_rec_insert_system" ON ai_recommendations
  FOR INSERT WITH CHECK (get_user_rol() = 'admin');

-- churn_interventions: solo gerente
ALTER TABLE churn_interventions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "intervention_select_gerente" ON churn_interventions;
DROP POLICY IF EXISTS "intervention_insert_gerente" ON churn_interventions;

CREATE POLICY "intervention_select_gerente" ON churn_interventions
  FOR SELECT USING (get_user_rol() IN ('gerente','admin'));

CREATE POLICY "intervention_insert_gerente" ON churn_interventions
  FOR INSERT WITH CHECK (get_user_rol() IN ('gerente','admin'));

-- digital_twin: propio
ALTER TABLE digital_twin ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "twin_select_own"  ON digital_twin;
DROP POLICY IF EXISTS "twin_update_own"  ON digital_twin;

CREATE POLICY "twin_select_own" ON digital_twin
  FOR SELECT USING (id_usuario = auth.uid());

CREATE POLICY "twin_update_own" ON digital_twin
  FOR ALL USING (id_usuario = auth.uid());

-- ─── ÍNDICES DE PERFORMANCE ────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_xp_usuario_fecha     ON gamification_xp(id_usuario, fecha_evento DESC);
CREATE INDEX IF NOT EXISTS idx_alerts_usuario_leida ON health_alerts(id_usuario, leida);
CREATE INDEX IF NOT EXISTS idx_ai_rec_usuario       ON ai_recommendations(id_usuario, mostrada);

-- ─── FIN MIGRACIÓN 003 ────────────────────────────────────────────────────────

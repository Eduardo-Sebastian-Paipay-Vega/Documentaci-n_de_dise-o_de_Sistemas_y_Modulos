# FASE 0 — Metodología DDS: Etapa 2 — Diseño Conceptual de la Base de Datos (42 RFs & DDD)

> **Proyecto**: Ecosistema Inteligente GYMsos / EDUCACION OS
> **Fase**: Fase 0 — Metodología DDS (Desarrollo Dirigido por Sistemas)
> **Etapa**: Etapa 2 — Diseño Conceptual de Base de Datos (Mapeo Completo 42 RFs)
> **Versión**: 2.0
> **Fecha**: 2026-08-01
> **Autor**: Eduardo Sebastian Paipay Vega

---

## 🏛️ 1. Arquitectura de Datos y Dominio para los 42 Requerimientos Funcionales

El modelo conceptual de datos abarca la totalidad de los **42 Requerimientos Funcionales**, organizados en **6 Dominio Core / Agregados DDD**:
1. **Core Curricular & LMS (`RF-001` a `RF-004`)**: Entidades de Cursos, Módulos, Lecciones y Entregas.
2. **Gamificación & Lealtad (`RF-005` a `RF-007`, `RF-036`)**: Badges, Puntos XP, Misiones y Billetera de Tokens.
3. **Finanzas & Subscripciones (`RF-008` a `RF-010`, `RF-034`)**: Suscripciones, Invoices, Cobranzas y Marketplace Plugins.
4. **Autonomous IA & Gemelo Digital (`RF-016`, `RF-021` a `RF-027`, `RF-037`, `RF-038`, `RF-040`)**: Early Warning, Pathing, DTL, Behavioral Telemetry, AI Swarm y Emotion Tracking.
5. **Red Operativa & Soberanía (`RF-028` a `RF-031`, `RF-035`, `RF-039`, `RF-041`)**: Peer Tutoring, Pinterest Educativo, Blockchain Credentialing, Proof of Skill y Universal Record.
6. **Administración & Gobernanza (`RF-011` a `RF-015`, `RF-017` a `RF-020`, `RF-033`, `RF-042`)**: Mensajería, Notificaciones, Docusign, Audit Logs e Invisible UI.

---

## 🧩 2. Especificación de Entidades y Pseudocódigo del Dominio Unificado

```pseudocode
// AGREGADO: Gemelo Digital & Telemetría Fina (RF-025, RF-038)
ENTIDAD DigitalTwinProfile (
  IDENTIFICADOR id: ULID PRIMARIA,
  RELACION student_id: REFERENCES User(id) UNICO OBLIGATORIO,
  RELACION tenant_id: REFERENCES Tenant(id) OBLIGATORIO,
  
  OBJETO_DE_VALOR CognitiveProfile (
    learning_style: ENUM('VISUAL', 'AUDITORY', 'KINESTHETIC'),
    processing_speed_index: DECIMAL(3,2),
    frustration_tolerance_score: DECIMAL(3,2),
    peak_attention_hours: ARRAY[TEXTO]
  ),
  
  CAMPO simulation_accuracy: DECIMAL(3,2) DEFAULT 0.85,
  AUDITORIA updated_at, version: ENTERO
)

// AGREGADO: Identidad Soberana & Proof of Skill (RF-031, RF-039)
ENTIDAD SovereignCredential (
  IDENTIFICADOR id: ULID PRIMARIA,
  RELACION student_id: REFERENCES User(id) OBLIGATORIO,
  CAMPO credential_type: ENUM('DEGREE', 'SKILL_BADGE', 'PROOF_OF_SKILL'),
  CAMPO claim_payload: JSONB NO NULO,
  CAMPO blockchain_tx_hash: TEXTO UNICO,
  CAMPO verification_qr_url: TEXTO UNICO NO NULO,
  CAMPO is_revoked: BOOLEANO DEFAULT FALSO,

  AUDITORIA issued_at: TIMESTAMP_UTC
)

// AGREGADO: Marketplace de Tutorías P2P & Tokens (RF-028, RF-036)
ENTIDAD TokenWallet (
  IDENTIFICADOR id: ULID PRIMARIA,
  RELACION user_id: REFERENCES User(id) UNICO OBLIGATORIO,
  CAMPO balance_tokens: DECIMAL(12,4) DEFAULT 0.0000,
  
  HISTORIAL token_transactions: LISTA_DE(
    tx_id: ULID, amount: DECIMAL, type: ENUM('EARNED', 'REDEEMED', 'TRANSFERRED'), reason: TEXTO
  ),
  
  AUDITORIA updated_at
)

// AGREGADO: Enjambre de Agentes de IA (RF-037)
ENTIDAD AgentSwarmInteraction (
  IDENTIFICADOR id: ULID PRIMARIA,
  RELACION student_id: REFERENCES User(id) OBLIGATORIO,
  CAMPO active_agent: ENUM('PSYCHOPEDAGOGUE', 'EVALUATOR', 'CAREER_CONCIERGE'),
  CAMPO prompt_context: TEXTO,
  CAMPO agent_response: TEXTO,
  CAMPO confidence_score: DECIMAL(3,2),
  
  AUDITORIA timestamp: TIMESTAMP_UTC DEFAULT AHORA()
)
```

---

## 🔒 3. Estrategia de Índices y Optimización para 42 RFs

1. **Índices de Telemetría Masiva (`RF-025`)**:
   * `CREATE INDEX idx_telemetry_student_time ON micro_interactions(student_id, timestamp DESC) INCLUDING (event_type);`
2. **Índices del Predictor de Deserción y EWS (`RF-016`, `RF-021`)**:
   * `CREATE INDEX idx_ews_risk ON student_risk_scores(tenant_id, risk_level) WHERE risk_level IN ('HIGH', 'CRITICAL');`
3. **Índices de Credenciales Blockchain y Proof of Skill (`RF-031`, `RF-039`)**:
   * `CREATE UNIQUE INDEX idx_credentials_tx ON sovereign_credentials(blockchain_tx_hash);`

---

*Fin de la Etapa 2 — Diseño Conceptual de Base de Datos (42 RFs) Metodología DDS v2.0.*

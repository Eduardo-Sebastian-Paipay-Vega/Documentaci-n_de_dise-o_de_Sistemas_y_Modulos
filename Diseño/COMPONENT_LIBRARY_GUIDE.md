# Guía de Librería de Componentes UI — Ecosistema GYMsos

> **Proyecto**: GYMsos Operating System
> **Fase**: Fase 6 — Sistema Central de Diseño
> **Versión**: 1.0
> **Fecha**: 2026-08-01
> **Autor**: Eduardo Sebastian Paipay Vega

---

## 🏛️ Visión General de la Catálogo de Componentes

La **Librería de Componentes GYMsos** especifica los patrones de interfaz reutilizables diseñados para garantizar consistencia visual y de comportamiento en las aplicaciones web y móviles del ecosistema GYMsos (**GIMNASIO**, **EDUCACION**, **Comerci**).

---

## 🧩 1. Componentes Principales de Interfaz

### 1.1 Botones Primarios y de Acción Rápida (`.btn-primary`)

Botones con resplandor dinámico y retroalimentación táctil de micro-animación.

```html
<button class="btn btn-primary" id="btn-start-session">
  <svg class="icon" aria-hidden="true"><use href="#icon-play"></use></svg>
  <span>Iniciar Entrenamiento Inteligente</span>
</button>
```

```css
.btn-primary {
  background: linear-gradient(135deg, var(--color-brand-primary), hsl(270, 80%, 55%));
  color: var(--text-primary);
  border: var(--border-glass-glow);
  padding: var(--space-3) var(--space-6);
  border-radius: var(--radius-md);
  font-family: var(--font-family-display);
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  cursor: pointer;
  box-shadow: var(--shadow-glow-primary);
  transition: transform var(--transition-bounce), box-shadow var(--transition-fast);
}

.btn-primary:hover {
  transform: translateY(-2px) scale(1.02);
  box-shadow: 0 0 25px var(--color-brand-glow);
}

.btn-primary:active {
  transform: translateY(0) scale(0.98);
}
```

---

### 1.2 Tarjetas Analíticas Glassmorphic (`.card-glass`)

Tarjeta contenedora con desenfoque de fondo y borde sutil brillante.

```html
<div class="card-glass" id="card-churn-prediction">
  <div class="card-header">
    <h3 class="card-title">Índice de Retención Predictiva</h3>
    <span class="badge badge-success">89% Precisión</span>
  </div>
  <div class="card-body">
    <p class="stat-number">94.2%</p>
    <p class="stat-label">Miembros activos con riesgo bajo de deserción</p>
  </div>
</div>
```

```css
.card-glass {
  background: var(--bg-surface-card);
  backdrop-filter: var(--backdrop-blur-std);
  -webkit-backdrop-filter: var(--backdrop-blur-std);
  border: var(--border-glass);
  border-radius: var(--radius-lg);
  padding: var(--space-6);
  transition: border-color var(--transition-normal), background var(--transition-normal);
}

.card-glass:hover {
  background: var(--bg-surface-card-hover);
  border: var(--border-glass-glow);
}
```

---

### 1.3 Tablas de Datos Densos y Métricas (`.table-data-dense`)

Diseñadas para la gestión masiva de datos en centros de entrenamiento y plataformas educativas.

```html
<table class="table-data-dense" id="table-active-members">
  <thead>
    <tr>
      <th scope="col">Usuario</th>
      <th scope="col">Nivel / Rango</th>
      <th scope="col">Asistencia (Mes)</th>
      <th scope="col">Estado IA</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Eduardo Paipay</td>
      <td>Pro Elite</td>
      <td>18 días</td>
      <td><span class="status-indicator status-optimal">Óptimo</span></td>
    </tr>
  </tbody>
</table>
```

---

## ♿ 2. Patrones de Usabilidad e Interacción

* **Navegación por Teclado**: Todos los elementos interactivos cuentan con `tabindex="0"` o son elementos nativos accesibles.
* **Estados de Carga**: Esqueletos animados (`.skeleton-loader`) para vistas de datos diferidas.
* **Alertas Dinámicas**: Notificaciones flotantes (*Toasts*) con rol ARIA `role="alert"`.

---

*Librería de Componentes UI v1.0 — GYMsos Operating System.*

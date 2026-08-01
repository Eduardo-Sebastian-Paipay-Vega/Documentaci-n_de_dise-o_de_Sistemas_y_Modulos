# Blueprint de Infraestructura, DevOps y CI/CD GYMsos

> **Proyecto**: GYMsos Operating System
> **Fase**: Gobernanza Global — DevOps e Infraestructura
> **Versión**: 1.0
> **Fecha**: 2026-08-01
> **Autor**: Eduardo Sebastian Paipay Vega

---

## 🏗️ 1. Arquitectura de Infraestructura en la Nube

La infraestructura de **GYMsos** está diseñada para escalar elásticamente soportando cargas de más de 2.5M+ de miembros activos y picos de sincronización biométrica.

```mermaid
graph LR
    User[Usuarios Web / Mobile] --> DNS[Cloudflare Edge DNS / WAF]
    DNS --> ALB[Application Load Balancer]
    ALB --> K8s[Kubernetes Cluster / App Pods]
    K8s --> Redis[(Cluster Redis - Cache/Session)]
    K8s --> PGMaster[(PostgreSQL Master - Writes)]
    PGMaster --> PGReplica[(PostgreSQL Replicas - Reads)]
```

---

## 🐳 2. Especificación de Contenedores Docker

### 2.1 Dockerfile Multi-Stage Producción (Backend Node.js/NestJS)

```dockerfile
# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Production
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --only=production
COPY --from=builder /app/dist ./dist
USER node
EXPOSE 3000
CMD ["node", "dist/main.js"]
```

---

## 🐙 3. Orquestación Local con Docker Compose (`docker-compose.yml`)

```yaml
version: '3.8'

services:
  gymsos-api:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://gymadmin:secure_pass@postgres:5432/gymsos_db?schema=public
      - REDIS_URL=redis://redis:6379
    depends_on:
      - postgres
      - redis

  postgres:
    image: postgres:16-alpine
    restart: always
    environment:
      POSTGRES_USER: gymadmin
      POSTGRES_PASSWORD: secure_pass
      POSTGRES_DB: gymsos_db
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  pgdata:
```

---

## 🚀 4. Pipeline de CI/CD (GitHub Actions)

```yaml
name: GYMsos CI/CD Pipeline

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  audit-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npm test
      - name: Security Scan (Trivy)
        uses: aquasecurity/trivy-action@master
        with:
          scan-type: 'fs'
          ignore-unfixed: true
```

---

## 🔄 5. Recuperación ante Desastres (Disaster Recovery Plan - DRP)

* **RPO (Recovery Point Objective)**: < 5 minutos (Replicación en tiempo real de Base de Datos).
* **RTO (Recovery Time Objective)**: < 15 minutos (Failover automático con Load Balancers y Pods redundantes).
* **Respaldos**: Backups diarios cifrados en almacenamiento S3 de redundancia geográfica.

---

*Blueprint de Infraestructura y DevOps v1.0 — GYMsos Operating System.*

# NovaFi Core Backend Infrastructure (NestJS) — Crypto → NGN

A production-oriented NestJS backend for a Nigeria-focused fintech where users deposit crypto (USDT, SOL, BNB, BTC, etc.), convert to NGN at market rates, and withdraw to Nigerian bank accounts. NGN deposits are **not** supported. KYC tiers unlock higher limits.

## Core Features

- **Auth & Users**: signup/login, refresh tokens, optional 2FA.
- **KYC**: tiered verification (BVN/NIN, ID, selfie), provider-agnostic adapters.
- **Crypto Deposits**: per-user addresses, confirmation tracking, sweeps.
- **Quoting & Conversion**: live quotes with spread/fees, crypto→NGN settlement.
- **Wallets & Ledger**: NGN wallet, crypto balances, strict double-entry accounting.
- **Payouts**: NGN withdrawals to verified beneficiaries via disbursement providers.
- **Compliance**: limits, velocity checks, risk flags, full audit trails.
- **Notifications**: email/SMS/in-app; webhooks for downstream systems.

## Architecture

- **NestJS** modular monolith with clear domain modules.
- **PostgreSQL** + **Prisma** for database management.
- **Redis** for cache/queues; **BullMQ** for jobs..
- **Object storage** (S3-compatible) for KYC documents.
- **Observability**: OpenTelemetry (traces/metrics), Prometheus, structured logs.
- **Logger**: Robust production grade logger using winston
- **Error Handling**: Centralized custom error handling and logging to both console and log file

## Local Development

### Prerequisites

- Node.js 20+, pnpm or yarn
- Docker + Docker Compose
- Make (optional)

### Quickstart

```bash
cp .env.example .env
docker compose up -d postgres redis
pnpm install
pnpm prisma migrate dev
pnpm start:dev
```

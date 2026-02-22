# Security Policy

## Supported Versions

The following versions of AGLA-Core receive active security updates:

| Version | Supported          |
| ------- | ------------------ |
| 2.x.x   | :white_check_mark: |
| 1.x.x   | :x:                |
| < 1.0   | :x:                |

## Reporting a Vulnerability

**Please do not report security vulnerabilities through public GitHub issues.**

Report vulnerabilities privately via [GitHub Security Advisories](https://github.com/tyy130/agla-core/security/advisories/new). This ensures sensitive details are not publicly exposed before a fix is available.

Alternatively, email **security@tacticdev.io** with the subject line `[AGLA-Core Security] <brief description>`.

### What to Include

A good report helps us triage quickly. Please provide:

- **Description** — what the vulnerability is and what an attacker could achieve
- **Affected component** — e.g., backend ingestion endpoint, FalkorDB traversal, NextAuth middleware
- **Steps to reproduce** — minimal, self-contained reproduction steps
- **Environment** — AGLA-Core version, OS, deployment method (Docker Compose / Kubernetes)
- **Proof of concept** — if safe to share, a script or request payload demonstrating the issue
- **Suggested fix** — optional, but always appreciated

### What to Expect

| Timeline | Action |
| -------- | ------ |
| **48 hours** | Initial acknowledgement of your report |
| **7 days** | Preliminary severity assessment and triage decision |
| **30 days** | Target remediation for high/critical severity issues |
| **90 days** | Target remediation for medium/low severity issues |

We will keep you updated throughout the process. If a fix requires more time, we'll communicate a revised timeline. Once resolved, we'll credit you in the release notes unless you prefer anonymity.

If you do not receive acknowledgement within 48 hours, follow up via email.

## Scope

### In Scope

The following are within scope for security reports:

- **FastAPI backend** (`backend/`) — authentication bypass, injection attacks, unsafe file parsing, insecure deserialization
- **Document ingestion pipeline** — path traversal, malicious file upload (PDF/DOCX/CSV/TXT), prompt injection via ingested content
- **LangGraph orchestrator** — prompt injection, unauthorized graph traversal, tenant data leakage across the FACTUAL/COMPLEX routing paths
- **Database layer** — SQL injection (PostgreSQL), Cypher injection (FalkorDB), unauthorized cross-tenant vector queries (Qdrant)
- **Next.js microfrontend** — XSS, CSRF, NextAuth middleware bypass on protected routes (`/chat/*`, `/ingest/*`, `/control/*`)
- **Docker Compose configuration** — exposed ports, secrets in environment variables, container escape
- **Terraform/OKE infrastructure** — IAM misconfigurations, publicly exposed services

### Out of Scope

- Vulnerabilities in third-party dependencies (report upstream to Qdrant, FalkorDB, LangChain, etc.)
- Denial-of-service attacks requiring excessive compute or bandwidth
- Social engineering of maintainers
- Issues in forks or unofficial distributions
- Rate limiting / brute-force on self-hosted deployments without reverse proxy

## Security Considerations for Deployers

AGLA-Core handles sensitive data including API keys, proprietary documents, and LLM query history. When self-hosting:

### API Keys
- Store `OPENAI_API_KEY` and database credentials in a secrets manager or a `.env` file excluded from version control — **never commit secrets to git**.
- Rotate keys if you suspect exposure.

### Network Exposure
- By default, service ports (8000, 6333, 6379, 6380, 5432) bind to `0.0.0.0`. In production, place all services behind a reverse proxy and restrict direct database access to internal networks only.
- Enable TLS on the FastAPI backend and all external-facing services.

### File Uploads
- The ingestion endpoint accepts PDF, DOCX, CSV, and TXT files. Restrict upload access to authenticated, trusted users only and validate MIME types server-side.

### LLM Prompt Injection
- Ingested documents can contain text that attempts to manipulate the LLM's behavior. Treat all ingested content as untrusted input.

### Multi-Tenancy
- All data is scoped by `tenant_id`. Audit your deployment to ensure tenant isolation is enforced at the Qdrant collection filter and FalkorDB query level.

## Disclosure Policy

We follow **coordinated disclosure**. We ask that:

1. You give us reasonable time to remediate before public disclosure.
2. You avoid accessing or modifying data that does not belong to you during research.
3. You do not perform destructive testing (e.g., data deletion, denial of service).

We will not pursue legal action against researchers who follow these guidelines in good faith.

---

*Built by [TacticDev](https://tacticdev.io).*

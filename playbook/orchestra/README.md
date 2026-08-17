# F.I. Forgot Orchestra — Implementation Architecture

This folder holds **Orchestra implementation architecture**: how F.I. Forgot governs software work against this repository.

It is **not** part of the Design Library.

It does **not** amend frozen Design Standards.

It does **not** define Volume 06 product-runtime behavior.

## Authority

| Layer | Location | Role |
|-------|----------|------|
| Frozen Design Library | `playbook/design/` | Product design law, including Volume 06 `FI-DSN-STD-012` through `FI-DSN-STD-015` |
| Orchestra constitutional runtime | `artifacts/api-server/src/orchestra/` | Implemented Volume 06 Domain 1–3 runtime |
| Product Brain pipeline | `artifacts/api-server/src/brain/` | Advisory product Brain; not Orchestra execution transport |
| This folder | `playbook/orchestra/` | How Orchestra consumes replaceable execution providers while retaining authoritative governance |

## Documents

| Document | Identifier | Status |
|----------|------------|--------|
| [01-execution-provider-architecture.md](01-execution-provider-architecture.md) | `ORCH-ARCH-001` | Architecture recorded |

## Rules

- Do not edit frozen `FI-DSN-STD-014` or `FI-DSN-STD-015` from this folder.
- Do not treat Cursor chat history, ChatGPT conversation history, Codex session state, or provider telemetry as Orchestra authoritative state.
- Do not implement Cursor SDK, ACP, Cursor hooks, or Codex SDK from these documents until a separately authorized sprint says so.

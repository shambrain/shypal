Patch contents:
- docs/protocol.md
- mobile/__tests__/crypto.test.ts
- mobile/__tests__/message_ttl.test.ts
- mobile/__tests__/simulated_discovery.test.ts

How to apply (git):
1. cd to your local clone of https://github.com/shambrain/shypal
2. git checkout -b phase1-protocol-tests
3. Copy files from this patch into the repo root (docs/, mobile/__tests__/)
4. git add docs/protocol.md mobile/__tests__/*
5. git commit -m "docs(protocol): add protocol.md; test: add deterministic unit tests"
6. git push origin phase1-protocol-tests
7. Open GitHub and create a PR from branch `phase1-protocol-tests` into `main`.

If you want I can also produce a ready-made git patch file (.patch) inside this zip.

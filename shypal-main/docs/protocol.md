# ShyPal Protocol (Phase-1) — definitive reference

## Purpose
This document is the canonical Phase-1 protocol reference for ShyPal. It describes ephemeral identity formats, transport constraints, chunking rules, crypto usage (Phase-1 placeholder + Phase-2 migration), TTL defaults, and minimal API shapes. This file must be kept in-sync with docs/threat_model.md and docs/engineer_handoff.md.

---

## Constants (Phase-1 defaults; can be tuned in Phase-2)
- EPHEMERAL_ROTATION_MS = 60_000  # rotate ephemeral IDs every 60 seconds
- DISCOVERY_ADV_INTERVAL_MS = 1000 # advertising interval (BLE adv) — best effort
- MESSAGE_TTL_SECONDS = 300        # messages auto-delete after 300s (5 min)
- CHUNK_SAFE_PAYLOAD_BYTES = 180   # conservative chunk payload size for GATT/ATT writes
- MAX_CHUNK_RETRIES = 5
- CHUNK_ACK_TIMEOUT_MS = 2000

---

## Ephemeral ID format (adv / discovery)
- Ephemeral IDs (EID) are 16 bytes (128 bits), encoded base64url for JSON transport and raw bytes for BLE adv.
- BLE adv payload MUST NOT attempt to include full EID + connection blob. Instead:
  - Put a compact advertisement token = first 8 bytes (prefix) of EID.
  - Include a small version+flags TLV byte:
    - version: 0x01
    - flags: bitmask (bit0: supports GATT fetch, bit1: supports scanResponse)
- If peer detects matching prefix, app SHOULD perform a GATT read (or connect via Nearby/Wi-Fi Direct) to fetch the full ephemeral payload.

---

## BLE advertising / scan response constraints
- Advertising payload practical limit: **31 bytes** (advertising data) + **31 bytes** (scan response) on classic BLE. Extended advertising exists but is not universally supported — do not rely on it in Phase-1.
- Use advertising for discovery-only: put an 8-byte EID prefix, 1-byte version+flags, and optionally a short service UUID.
- **Do not** place any private data or keys in advertising payloads.
- When full payload is required, use **GATT read** from the advertising peer or use the platform's scan response to store a pointer (e.g., small server token) that the other side can use to fetch details.

---

## GATT / MTU / chunking rules
- Default ATT MTU is 23 bytes → effective payload ≈ 20 bytes. Many devices negotiate MTU upward (Android often negotiates up to 517), but this is not guaranteed.
- Implement an MTU negotiation and probe at runtime:
  1. On connect, attempt `requestMtu()` (Android) / set maximum allowed on iOS where possible.
  2. Determine `mtu_eff = negotiated_mtu - 3` (ATT overhead) and set chunk size = min(mtu_eff, CHUNK_SAFE_PAYLOAD_BYTES).
- **Chunking protocol**:
  - Frame: `[frameType (1B)] [seq (2B)] [payloadLen (2B)] [payload]`
  - frameType: 0x01 = DATA, 0x02 = ACK, 0x03 = CTRL
  - Each DATA chunk must be acked by peer with ACK(seq).
  - On missing ACK, retransmit up to MAX_CHUNK_RETRIES with exponential backoff.
- Implement chunk reassembly and integrity checks (hash per message).

---

## Transport selection priority (runtime)
1. Platform-native high-throughput P2P (Nearby Connections on Android with Wi-Fi Direct, MultipeerConnectivity on iOS).
2. BLE peripheral/central with GATT fetch for payloads.
3. Wi-Fi fallback (if both devices on same LAN and library available).
4. If platform-specific services (Google Play Services / Nearby) are unavailable, fallback to BLE + Wi-Fi Direct.

Document all fallbacks and platform dependencies in `engineer_handoff.md`.

---

## Message envelope (wire format)
- Use a compact binary TLV or CBOR for transport. Example (JSON for clarity; use CBOR in production):
```
{
  "v": 1,
  "from_eid": "<base64url 16B>",
  "to_eid": "<base64url 16B>",
  "msg_type": "introRequest" | "introResponse" | "appMessage",
  "nonce": "<base64url>",
  "body": "<base64url_encrypted_payload>"
}
```
- Add `flags` and `seq` fields for chunking and ordering.

---

## Crypto (Phase-1 and Phase-2 roadmap)
**Phase-1 (Dev / Proof):**
- Use `tweetnacl` in JS for ephemeral end-to-end encryption; keep it strictly as a placeholder with tests and deterministic vectors.
- Provide unit tests for the following properties:
  - X25519 ECDH shared secret symmetry (A->B == B->A)
  - AEAD roundtrip using encryption/decryption wrappers (AES-GCM or NaCl box)

**Warnings / Caveats:**
- For AES-GCM and AEAD primitives, **nonce reuse is catastrophic**. Maintain strict per-key nonce counters or use libsodium `crypto_aead_xchacha20poly1305` for safer nonce schemes.
- Do not roll your own padding/oracle protection—use established libs (libsodium, libsignal).
- Phase-2 MUST replace JS placeholders with native libsodium or libsignal bindings (libsignal for double ratchet if forward secrecy & post-compromise security are required).

**Phase-2 (Production):**
- Replace JS crypto with native libs:
  - iOS: libsodium wrapper or libsignal native implementation (Swift).
  - Android: libsodium via JNI / libsignal native (Kotlin).
- Use Secure Enclave / Android Keystore for storing long-term identity keys (non-exportable). Document migration scripts to rotate keys.

---

## Key storage & lifecycle
- Long-term identity private keys MUST be hardware-backed when available:
  - iOS: Secure Enclave (Keychain with kSecAttrAccessControl / kSecAttrTokenIDSecureEnclave).
  - Android: Android Keystore with KEYSTORE_FLAG_NO_EXPORT.
- Ephemeral keys rotate every `EPHEMERAL_ROTATION_MS`.
- Key revocation / rotation plan:
  - Keep short lived prekeys for messaging.
  - If migrating keys, perform server-assisted re-encryption handshake without exposing private key.

---

## Backend minimal API shapes (Phase-1 placeholder)
- `POST /devices/register`
  - Request: `{ "pubkey": "<base64>", "client_version": "x.y.z" }`
  - Response: `{ "device_id": "dev_xxx", "token": "jwt_or_token" }`
- `POST /friends/upload`
  - Request: `{ "device_id": "...", "friend_blob": "<base64_encrypted>" }`
  - Response: `{ "status": "ok" }`
- `POST /messages/push`
  - Request: `{ "from_device": "...", "to_device": "...", "payload": "..." }`
  - Response: `{ "status": "enqueued" }`
- `POST /reports`
  - Request: `{ "report": "<hashed_record>" }`
  - Response: `{ "status": "ok" }`

**Privacy**: Backend should store minimal metadata (device_id, timestamp). Do not store plaintext messages. Add DB encryption for stored blobs.

---

## Integration tests & deterministic mode
- Discovery: include a deterministic mode where `simulated_discovery` uses a seeded RNG (seed provided by env var `SIM_DISCOVERY_SEED`) so tests are reproducible.
- TTL engine: expose a `now()` injection to accelerate GC in tests.

---

## App store & permissions microcopy (suggested)
- Bluetooth: "ShyPal uses Bluetooth to discover nearby devices so you can privately exchange contact tokens with people near you."
- Local Network (iOS Local Network): "Required to discover nearby devices on your local Wi-Fi network."
- Background modes (iOS): explain background scanning is limited by OS and battery, offer an opt-in 'discovery keep-alive' with clear consent.

---

## Audit checklist (short)
- Unit tests for X25519 ECDH test vectors.
- AEAD encryption/decryption tests with nonce-uniqueness assertion.
- Key storage verification on real devices (Secure Enclave / Keystore).
- Ble chunking+reassembly fuzz tests (simulate dropped chunks).
- External crypto audit for libsignal/libsodium usage in Phase-2.

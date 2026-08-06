// src/services/sync-service.js — explicit no-op. README lists cloud sync
// as an "Optional Future Backend" (Phase 8), which does not exist yet.
// This module documents the intended interface without faking a network
// call, so callers can be written against the real shape in advance.

import { config } from "../app/config.js";

export function syncAvailable() {
  return config.features.cloudSync;
}

/** @returns {Promise<{ ok: boolean, reason?: string, syncedAt?: string }>} */
export async function syncNow() {
  if (!syncAvailable()) {
    return { ok: false, reason: "Cloud sync is not available in this offline-only build." };
  }
  // Intentionally unimplemented — no backend exists to sync against yet.
  return { ok: false, reason: "not implemented" };
}

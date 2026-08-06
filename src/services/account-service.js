// src/services/account-service.js — LOCAL-ONLY profile management.
// There is no auth/accounts backend yet (README Phase 8 is unimplemented),
// so this intentionally never makes a network call. `isAuthenticated()`
// is always false; treat this as a placeholder for local personalization
// only (display name, avatar), not real login.

import { getProfile, saveProfile } from "../storage/user-storage.js";
import { config } from "../app/config.js";

export async function getLocalProfile() {
  return getProfile();
}

export async function updateLocalProfile(patch) {
  const current = await getProfile();
  return saveProfile({ ...current, ...patch });
}

export function isAuthenticated() {
  return false;
}

export function accountsBackendAvailable() {
  return config.features.accountsBackend;
}

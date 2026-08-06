// src/storage/user-storage.js — local learner profile + preferences.
// See schemas/user.schema.json. No account/auth backend exists yet
// (Phase 8) — this is purely local, device-scoped storage.

import { get, put } from "./indexed-db.js";
import { getItem, setItem } from "./local-storage.js";

const LOCAL_USER_ID = "local-user";

export async function getProfile() {
  const record = await get("user", LOCAL_USER_ID);
  return record || { id: LOCAL_USER_ID, displayName: "", preferences: {} };
}

export async function saveProfile(profile) {
  return put("user", { ...profile, id: LOCAL_USER_ID });
}

export function getPreference(key, fallback) {
  return getItem(`pref:${key}`, fallback);
}

export function setPreference(key, value) {
  return setItem(`pref:${key}`, value);
}

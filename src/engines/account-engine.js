// src/engines/account-engine.js — see services/account-service.js for
// why this is local-only (no auth backend exists yet).
export {
  getLocalProfile,
  updateLocalProfile,
  isAuthenticated,
  accountsBackendAvailable,
} from "../services/account-service.js";

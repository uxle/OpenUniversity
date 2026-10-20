// src/components/account/logout.js — clears local profile display name
// only (there's no session to end, since there's no auth backend).
import { createButton } from "../common/button.js";
import { updateLocalProfile } from "../../engines/account-engine.js";
import { showToast } from "../common/toast.js";

export function createLogoutButton() {
  return createButton({
    label: "Clear local profile",
    // Destructive action: danger styling + a confirm step. It previously
    // rendered as a quiet ghost link sitting next to the profile — easy
    // to tap by accident, with no visual signal that it erases the
    // stored name.
    variant: "danger",
    onClick: async () => {
      if (!window.confirm("Clear your display name and local profile? This can't be undone.")) return;
      await updateLocalProfile({ displayName: "" });
      showToast("Local profile cleared", "info");
    },
  });
}

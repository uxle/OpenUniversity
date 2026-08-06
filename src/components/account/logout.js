// src/components/account/logout.js — clears local profile display name
// only (there's no session to end, since there's no auth backend).
import { createButton } from "../common/button.js";
import { updateLocalProfile } from "../../engines/account-engine.js";
import { showToast } from "../common/toast.js";

export function createLogoutButton() {
  return createButton({
    label: "Clear local profile",
    variant: "ghost",
    onClick: async () => {
      await updateLocalProfile({ displayName: "" });
      showToast("Local profile cleared", "info");
    },
  });
}

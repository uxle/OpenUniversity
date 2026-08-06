// src/pages/profile.js
import { createEl, mount } from "../utils/dom.js";
import { createProfileView } from "../components/account/profile.js";
import { createLogoutButton } from "../components/account/logout.js";

export async function render(container) {
  document.title = "Profile — OpenKnowledge";
  mount(container, createEl("div", { class: "ou-container ou-stack" }, [
    await createProfileView(),
    createLogoutButton(),
  ]));
}

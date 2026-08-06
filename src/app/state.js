// src/app/state.js — the app-wide store's initial shape.

import { createStore } from "../core/store.js";
import { config } from "./config.js";

export const initialState = {
  theme: config.defaultTheme,
  locale: config.defaultLocale,
  route: { path: "/", params: {} },
  currentUser: null,
  subjectsLoaded: false,
};

export const appStore = createStore(initialState);

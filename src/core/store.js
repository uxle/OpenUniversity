// src/core/store.js — tiny observable state container (no Redux/deps).

export function createStore(initialState = {}) {
  let state = { ...initialState };
  const subscribers = new Set();

  function getState() {
    return state;
  }

  function setState(patch) {
    const next = typeof patch === "function" ? patch(state) : patch;
    state = { ...state, ...next };
    subscribers.forEach((fn) => fn(state));
    return state;
  }

  function subscribe(fn) {
    subscribers.add(fn);
    return () => subscribers.delete(fn);
  }

  return { getState, setState, subscribe };
}

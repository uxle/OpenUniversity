// src/core/event-bus.js — minimal pub/sub used to decouple modules
// (e.g. error-handler emits "app:error"; a toast component listens).

export function createEventBus() {
  const listeners = new Map();

  function on(event, handler) {
    if (!listeners.has(event)) listeners.set(event, new Set());
    listeners.get(event).add(handler);
    return () => off(event, handler);
  }

  function off(event, handler) {
    listeners.get(event)?.delete(handler);
  }

  function emit(event, payload) {
    listeners.get(event)?.forEach((handler) => {
      try {
        handler(payload);
      } catch (err) {
        console.error(`[event-bus] listener for "${event}" threw`, err);
      }
    });
  }

  function once(event, handler) {
    const unsubscribe = on(event, (payload) => {
      unsubscribe();
      handler(payload);
    });
    return unsubscribe;
  }

  return { on, off, emit, once };
}

// Shared app-wide instance — most modules should import this rather than
// creating their own bus, so events actually reach each other.
export const eventBus = createEventBus();

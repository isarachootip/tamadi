const RELOAD_GUARD_KEY = "tamadee_vendor_chunk_reload_at";
const RELOAD_COOLDOWN_MS = 30_000;

let installed = false;

/**
 * Recovers automatically when a seller's browser tab stays open across a
 * Coolify deployment and Vite fails to fetch an outdated lazy-loaded JS chunk.
 * Uses a 30-second sessionStorage cooldown so it can never enter a reload loop.
 */
export function installStaleChunkRecovery(): void {
  if (installed || typeof window === "undefined") {
    return;
  }
  installed = true;

  window.addEventListener("vite:preloadError", (event) => {
    event.preventDefault();
    try {
      const lastReloadRaw = window.sessionStorage.getItem(RELOAD_GUARD_KEY);
      const lastReloadAt = lastReloadRaw ? Number(lastReloadRaw) : 0;
      if (Number.isFinite(lastReloadAt) && Date.now() - lastReloadAt < RELOAD_COOLDOWN_MS) {
        return;
      }
      window.sessionStorage.setItem(RELOAD_GUARD_KEY, String(Date.now()));
    } catch {
      // Ignore storage access restrictions
    }
    window.location.reload();
  });
}

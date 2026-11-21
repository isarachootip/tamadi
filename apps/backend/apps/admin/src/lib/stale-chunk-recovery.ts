const RELOAD_GUARD_KEY = "tamadee_admin_chunk_reload_at";
const RELOAD_COOLDOWN_MS = 30_000;

let installed = false;

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
      // Ignore storage restrictions
    }
    window.location.reload();
  });
}

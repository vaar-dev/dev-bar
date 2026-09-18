// Bundlers like webpack/Next.js statically replace `process.env.NODE_ENV`
// without a real Node runtime being present, so we declare just enough of
// the shape to check it without depending on @types/node.
declare const process: { env?: { NODE_ENV?: string } } | undefined;

/**
 * Best-effort detection of "development mode" that works whether the host app
 * is bundled with Vite, webpack, or something else, and falls back to a
 * localhost check when no build-time env is available.
 */
export function isDevEnvironment(): boolean {
  try {
    const viteEnv = (import.meta as ImportMeta & { env?: { DEV?: boolean } })
      .env;
    if (viteEnv && typeof viteEnv.DEV === "boolean") {
      return viteEnv.DEV;
    }
  } catch {
    // import.meta.env not available in this build target - ignore.
  }

  try {
    if (typeof process !== "undefined" && process.env?.NODE_ENV) {
      return process.env.NODE_ENV !== "production";
    }
  } catch {
    // process not available in the browser - ignore.
  }

  try {
    if (typeof window !== "undefined" && window.location) {
      const host = window.location.hostname;
      if (
        host === "localhost" ||
        host === "127.0.0.1" ||
        host === "[::1]" ||
        host.endsWith(".localhost")
      ) {
        return true;
      }
    }
  } catch {
    // no window - ignore.
  }

  return false;
}

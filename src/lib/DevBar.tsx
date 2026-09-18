import DevBarPanel from "./DevBarPanel";
import type { DevBarProps } from "./types";

// Renders DevBarPanel directly (no React.lazy) - since DevBarView is a
// public export from this same module, bundlers can't split it out of
// this chunk anyway (they'd need it available synchronously either way).
// For real code-splitting, lazy-load DevBarView yourself - see the README.
export function DevBar({ isDev, ...viewProps }: DevBarProps) {
  if (!isDev) return null;

  return <DevBarPanel {...viewProps} />;
}

import { useEffect, useState } from "react";
import { devBarStyles } from "./styles";

/**
 * Creates an isolated shadow-DOM host appended directly to <body>, so the
 * dev bar is immune to the host page's CSS (and vice versa) and its
 * `position: fixed` is never trapped by an ancestor with a transform.
 * Returns the mount node to portal React content into, once attached.
 */
export function useShadowHost(): HTMLElement | null {
  const [mountNode, setMountNode] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (typeof document === "undefined") return;

    const host = document.createElement("div");
    host.setAttribute("data-devbar-root", "");
    document.body.appendChild(host);

    const shadow = host.attachShadow({ mode: "open" });
    const style = document.createElement("style");
    style.textContent = devBarStyles;
    shadow.appendChild(style);

    const mount = document.createElement("div");
    shadow.appendChild(mount);
    // The DOM node only exists once this effect runs, so there's no render
    // to derive it from - this is synchronizing with an external system.
    // oxlint-disable-next-line react/set-state-in-effect
    setMountNode(mount);

    return () => {
      document.body.removeChild(host);
    };
  }, []);

  return mountNode;
}

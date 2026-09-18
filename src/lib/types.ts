import type { ComponentType, LazyExoticComponent, ReactNode } from "react";

export type DevBarPosition =
  | "top-left"
  | "top-center"
  | "top-right"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right";

/** Props passed to every tool's `component` while its pane is open. */
export interface DevBarToolProps {
  /** Closes this tool's pane. */
  close: () => void;
}

/**
 * The plugin contract for a dev bar tool. An npm package can ship one of
 * these (built with `defineDevBarTool`) for consumers to drop into
 * `<DevBar tools={[...]} />` alongside their own.
 */
export interface DevBarTool {
  /** Unique id for this tool, used to track which pane is open. */
  id: string;
  /** Shown as the button's tooltip and the pane's heading. */
  label: string;
  /** Icon shown on the tool's button. Defaults to the label's first letter. */
  icon?: ReactNode;
  /**
   * Rendered inside the tool's pane while it's open. Can be a plain
   * component, or `React.lazy(() => import('./MyPanel'))` for a heavier
   * tool - its code then lives in its own chunk that's only fetched the
   * first time this tool's pane is opened (never, if the dev bar itself
   * is disabled).
   */
  component:
    | ComponentType<DevBarToolProps>
    | LazyExoticComponent<ComponentType<DevBarToolProps>>;
}

/**
 * Props for `DevBarView`, the bar itself with no environment gating or
 * lazy-loading of its own - it always mounts when rendered. Use this
 * directly if you're already lazy-loading and/or isDev-gating the dev bar
 * yourself; otherwise use `DevBar`, which wraps this with both.
 */
export interface DevBarViewProps {
  /** Corner of the viewport the dev bar docks to. Defaults to 'bottom-right'. */
  position?: DevBarPosition;
  /** Icon shown on the collapsed toggle button. Defaults to a generic tools glyph. */
  icon?: ReactNode;
  /** Developer-configurable tools shown in the expanded toolbar. */
  tools?: DevBarTool[];
}

export interface DevBarProps extends DevBarViewProps {
  /**
   * Force the dev bar on/off. Omit to auto-detect based on the environment
   * (Vite/webpack dev mode, NODE_ENV, or localhost).
   */
  isDev?: boolean;
}

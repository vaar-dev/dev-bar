import type { DevBarTool } from "./types";

/**
 * Identity helper for authoring a `DevBarTool` with type-checking and
 * editor autocomplete. Purely a typing aid - useful for an npm package
 * that wants to export a ready-to-use tool, e.g.:
 *
 * ```tsx
 * export const reactQueryTool = defineDevBarTool({
 *   id: 'react-query',
 *   label: 'React Query',
 *   component: ReactQueryPanel,
 * })
 * ```
 */
export function defineDevBarTool(tool: DevBarTool): DevBarTool {
  return tool;
}

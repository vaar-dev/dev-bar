# dev-bar

A drop-in developer toolbar component for React apps. Starts out as a
small square button (bottom-right by default); clicking it expands into
a horizontal toolbar of developer-configured tools, where each tool
button opens its own pane of custom content.

- **Off by default in production.** Auto-detects dev mode (Vite/webpack
  `DEV`/`NODE_ENV`, or `localhost`) unless you override it with `isDev`.
- **Zero styling footprint.** Renders into an isolated shadow DOM, so the
  bar's CSS never leaks onto your page and your page's CSS never leaks
  into the bar. No stylesheet to import.
- **Code-splittable when you want it.** `<DevBar>` alone doesn't split
  anything out of your bundle by itself - it can't, once you're also able
  to import `DevBarView` from the same package for your own lazy-loading
  (see below). Instead, `DevBarView` is designed to drop straight into
  your own `React.lazy`, so the bar and however many of your tools live in
  exactly the chunk(s) you choose. See
  [Code-splitting the bar and its tools](#code-splitting-the-bar-and-its-tools).

## Install

```sh
npm install dev-bar
```

`react` and `react-dom` (^18 or ^19) are peer dependencies.

## Usage

```tsx
import { DevBar, defineDevBarTool, type DevBarToolProps } from "dev-bar";

function ConsoleTool({ close }: DevBarToolProps) {
  return (
    <button
      onClick={() => {
        console.log("hello from dev bar");
        close();
      }}
    >
      Log something
    </button>
  );
}

const consoleTool = defineDevBarTool({
  id: "console",
  label: "Console",
  icon: "▶",
  component: ConsoleTool,
});

function App() {
  return (
    <>
      {/* ...your app... */}
      <DevBar tools={[consoleTool]} />
    </>
  );
}
```

Clicking the square toggle button expands it into a row of tool buttons;
clicking a tool button opens that tool's pane, rendering its `component`.
Clicking the same tool again (or its pane's close button) closes the pane;
collapsing the toolbar closes any open pane too.

### Tools as plugins

A `DevBarTool` is a plain, serializable-shaped object - `{ id, label, icon?,
component }` - so any npm package can export one for consumers to drop
straight into their `tools` array, alongside their own:

```tsx
// in an npm package, e.g. "devbar-tool-react-query"
import { defineDevBarTool, type DevBarToolProps } from "dev-bar";

function ReactQueryPanel({ close }: DevBarToolProps) {
  return <div>{/* ...inspect the query cache... */}</div>;
}

export const reactQueryTool = defineDevBarTool({
  id: "react-query",
  label: "React Query",
  icon: "⚛",
  component: ReactQueryPanel,
});
```

```tsx
// in the consuming app
import { DevBar } from "dev-bar";
import { reactQueryTool } from "devbar-tool-react-query";
import { myOwnTool } from "./devbar-tools/my-own-tool";

<DevBar tools={[reactQueryTool, myOwnTool]} />;
```

`defineDevBarTool` is just an identity function - it exists purely so
plugin authors get type-checking and autocomplete while building the
object; you can also build the plain object yourself. A tool that needs
options (an API key, a feature list, ...) is just a factory function that
returns a `DevBarTool`, e.g. `createReactQueryTool(options)`.

`DevBar` itself owns mounting each tool's `component` - it's only
instantiated once its pane is opened, and unmounted when the pane closes.

### Code-splitting the bar and its tools

`tools` is a plain prop: whatever you pass into it - including every
tool's `component` - has to be evaluated before `<DevBar>` even renders,
which puts it in your main bundle regardless of `isDev`. `DevBar` itself
doesn't lazy-load anything internally: since `DevBarView` is also a
regular export from this package (see below), a bundler can't split it
out of `DevBar`'s own module on its own - it has no way to know you won't
also import `DevBarView` directly elsewhere. Code-splitting has to happen
at an import boundary you control. There are two ways to do that, and you
can mix them.

**Own the whole thing yourself (recommended for anything nontrivial).**
`DevBarView` is the same bar, minus the `isDev` check - it always mounts
when rendered, so you decide when that happens. Put the bar and its tools
in one module and lazy-load that module yourself:

```tsx
// devbar.tsx - everything the bar needs, in one place
import { DevBarView, defineDevBarTool } from "dev-bar";
import ConsoleTool from "./tools/ConsoleTool";
import ReactQueryPanel from "./tools/ReactQueryPanel";

const tools = [
  defineDevBarTool({ id: "console", label: "Console", component: ConsoleTool }),
  defineDevBarTool({
    id: "react-query",
    label: "React Query",
    component: ReactQueryPanel,
  }),
];

export default function DevBarSetup() {
  return <DevBarView tools={tools} />;
}
```

```tsx
// App.tsx
import { lazy, Suspense } from "react";
import { isDevEnvironment } from "dev-bar";

const DevBarSetup = lazy(() => import("./devbar"));

function App() {
  return (
    <>
      {/* ...your app... */}
      {isDevEnvironment() && (
        <Suspense fallback={null}>
          <DevBarSetup />
        </Suspense>
      )}
    </>
  );
}
```

Now the bar and every tool it imports live in one chunk that's only
fetched when `isDevEnvironment()` is true (swap in your own flag if you
need to force it) - no per-tool `lazy()` needed, and no redundant nested
lazy boundary on top of your own. You can still `lazy()` an individual
tool inside `devbar.tsx` if you want it split further (say, one
particularly heavy tool you rarely open) - `component` accepts either.

**Or keep using plain `<DevBar tools={[...]} />`, and `lazy()` individual
tools.** If you're not wrapping anything yourself, wrap a nontrivial
tool's `component` directly:

```tsx
const reactQueryTool = defineDevBarTool({
  id: "react-query",
  label: "React Query",
  icon: "⚛",
  component: lazy(() => import("./ReactQueryPanel")),
});
```

Bundlers split `import()` into its own chunk regardless of whether it's
wrapped in `lazy()`, but the chunk is only ever _fetched_ once React
actually tries to render that component - i.e. the first time that tool's
pane is opened. If the dev bar is disabled, it never mounts, so none of
your tools' panes ever render and none of their chunks are ever fetched.

Either way, both `DevBar` and `DevBarView` wrap each pane's body in its
own `<Suspense>`, so loading a lazy tool only shows a brief "Loading…"
state in its pane - the rest of the toolbar stays interactive.

### Props

| Prop       | Type                                                                                              | Default               | Description                                           |
| ---------- | ------------------------------------------------------------------------------------------------- | --------------------- | ----------------------------------------------------- |
| `isDev`    | `boolean`                                                                                         | auto-detected         | Force show/hide. Omit to auto-detect the environment. |
| `position` | `'top-left' \| 'top-center' \| 'top-right' \| 'bottom-left' \| 'bottom-center' \| 'bottom-right'` | `'bottom-right'`      | Where the bar docks to along the viewport edge.       |
| `icon`     | `ReactNode`                                                                                       | a generic tools glyph | Icon shown on the collapsed toggle button.            |
| `tools`    | `DevBarTool[]`                                                                                    | `[]`                  | The tools shown in the expanded toolbar.              |

`DevBarView` takes the same props except `isDev` (it always renders when
you render it).

A `DevBarTool` is:

| Field       | Type                                                           | Description                                                              |
| ----------- | -------------------------------------------------------------- | ------------------------------------------------------------------------ |
| `id`        | `string`                                                       | Unique id, used to track which pane is open.                             |
| `label`     | `string`                                                       | Tooltip text and the pane's heading.                                     |
| `icon`      | `ReactNode`                                                    | Optional icon for the tool button; defaults to the label's first letter. |
| `component` | `ComponentType<DevBarToolProps>` (or `React.lazy(...)` of one) | Rendered inside the tool's pane while it's open.                         |

`DevBarToolProps` is `{ close: () => void }`, passed to every tool
component so it can close its own pane.

Force it on or off explicitly regardless of environment:

```tsx
<DevBar isDev={false} />
<DevBar isDev={import.meta.env.MODE === 'staging'} />
```

## Local development

This repo also contains a small demo app (`src/DemoApp.tsx`) used to develop
and preview the component.

```sh
npm run dev         # run the demo app with the dev bar mounted
npm run build        # build the publishable library into dist/
npm run build:demo   # build the demo app (not published)
```

Only `dist/` is published to npm (see the `files` field in
`package.json`); the demo app source never ships.

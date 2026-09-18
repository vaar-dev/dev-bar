# dev-bar

A drop-in developer toolbar component for React apps. Starts out as a
small square button (bottom-right by default); clicking it expands into
a horizontal toolbar of developer-configured tools, where each tool
button opens its own pane of custom content.

- **You control when it shows.** `isDev` is a required prop with no
  built-in auto-detection - "dev" means something different in every
  setup, so there's no environment check this package could bake in that
  would be right for everyone. See
  [Determining `isDev`](#determining-isdev) for examples.
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
npm install @vaardev/dev-bar
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
      {/* import.meta.env.DEV is Vite's flag - see "Determining isDev" for
          other bundlers, and for hiding it in staging/preview too. */}
      <DevBar isDev={import.meta.env.DEV} tools={[consoleTool]} />
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

<DevBar isDev={import.meta.env.DEV} tools={[reactQueryTool, myOwnTool]} />;
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
at an import boundary you control, using whatever `isDev`-equivalent
check you've settled on (see [Determining `isDev`](#determining-isdev)).
There are two ways to do that, and you can mix them.

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

const IS_DEV = import.meta.env.DEV; // or whatever fits your setup

const DevBarSetup = lazy(() => import("./devbar"));

function App() {
  return (
    <>
      {/* ...your app... */}
      {IS_DEV && (
        <Suspense fallback={null}>
          <DevBarSetup />
        </Suspense>
      )}
    </>
  );
}
```

Now the bar and every tool it imports live in one chunk that's only
fetched when `IS_DEV` is true - no per-tool `lazy()` needed, and no
redundant nested lazy boundary on top of your own. You can still `lazy()`
an individual tool inside `devbar.tsx` if you want it split further (say,
one particularly heavy tool you rarely open) - `component` accepts either.

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

| Prop       | Type                                                                                              | Default               | Description                                                             |
| ---------- | ------------------------------------------------------------------------------------------------- | --------------------- | ----------------------------------------------------------------------- |
| `isDev`    | `boolean`                                                                                         | _(required)_          | Whether the bar renders. See [Determining `isDev`](#determining-isdev). |
| `position` | `'top-left' \| 'top-center' \| 'top-right' \| 'bottom-left' \| 'bottom-center' \| 'bottom-right'` | `'bottom-right'`      | Where the bar docks to along the viewport edge.                         |
| `icon`     | `ReactNode`                                                                                       | a generic tools glyph | Icon shown on the collapsed toggle button.                              |
| `tools`    | `DevBarTool[]`                                                                                    | `[]`                  | The tools shown in the expanded toolbar.                                |

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

### Determining `isDev`

There's no auto-detection, by design. "Dev" means something different in
every setup, and there's no environment check this package could bake in
that would be reliable across all of them:

- `import.meta.env.DEV` is a Vite-only API, and Vite fully resolves it
  into a static object during _any_ `vite build`, including this
  library's own build when it gets published. A check for it inside this
  package would always see _this package's_ build mode, never yours.
- Hostname conventions vary too much to guess: `localhost` covers plain
  local dev, but plenty of teams run local dev behind a custom domain
  (`*.dev.internal`, a `/etc/hosts` entry, a tunnel), and "is this
  hostname a dev environment" is genuinely undecidable from the outside.

So: figure out what "dev" means for your app, the same way you would for
any other environment-conditional code, and pass it in. A few common
shapes:

```tsx
// Vite
const IS_DEV = import.meta.env.DEV;

// webpack / Create React App / Next.js (client-side)
const IS_DEV = process.env.NODE_ENV !== "production";

// A custom local-dev hostname convention
const IS_DEV = window.location.hostname.endsWith(".dev.internal");
```

**Multiple pre-production environments.** If your setup has more than
just dev/prod - say `development`, `staging`, `qa`, `production` - `isDev`
is still just "should this render at all," and `tools` is a plain array
you already control, so no extra API is needed to vary either by
environment:

```tsx
type AppEnv = "development" | "staging" | "qa" | "production";
const APP_ENV = import.meta.env.VITE_APP_ENV as AppEnv;

const IS_DEV = APP_ENV !== "production";

// Only show a "reset test data" tool somewhere it can't hit real users.
const tools = APP_ENV === "production" ? [] : [consoleTool, resetTestDataTool];

<DevBar isDev={IS_DEV} tools={tools} />;
```

Compute this once per app (a module-level constant, as above) and reuse
it everywhere you need an environment check, `DevBar`'s `isDev` included.

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

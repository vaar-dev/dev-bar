import { lazy, useEffect, useState } from "react";
import { DevBarView, defineDevBarTool, type DevBarToolProps } from "./lib";

// Everything the dev bar needs, in one module that DemoApp.tsx lazy-loads
// itself - see "Code-splitting the bar and its tools" in the README.

function ViewportInfo() {
  const [size, setSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const onResize = () =>
      setSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <dl>
      <div>
        <dt>Viewport</dt>
        <dd>
          {size.width}×{size.height}
        </dd>
      </div>
      <div>
        <dt>URL</dt>
        <dd>{window.location.pathname}</dd>
      </div>
    </dl>
  );
}

function ConsoleTool({ close }: DevBarToolProps) {
  return (
    <button
      type="button"
      onClick={() => {
        console.log("hello from dev bar");
        close();
      }}
    >
      Log something and close
    </button>
  );
}

// Tools defined this way are just plain objects - an npm package could
// export one of these for consumers to add to their `tools` array.
const infoTool = defineDevBarTool({
  id: "info",
  label: "Info",
  icon: "ℹ",
  component: ViewportInfo,
});
const consoleTool = defineDevBarTool({
  id: "console",
  label: "Console",
  icon: "▶",
  component: ConsoleTool,
});

// A heavier tool can still be split further within this already-lazy
// module - its code is only fetched the first time this tool's pane opens.
const backgroundTool = defineDevBarTool({
  id: "background",
  label: "Background",
  icon: "◐",
  component: lazy(() => import("./tools/BackgroundTool")),
});

export default function DevBarSetup() {
  return <DevBarView tools={[infoTool, consoleTool, backgroundTool]} />;
}

import { Suspense, useState } from "react";
import { createPortal } from "react-dom";
import { useShadowHost } from "./useShadowHost";
import { DefaultIcon } from "./icons";
import type { DevBarViewProps } from "./types";

/**
 * The dev bar itself - no environment gating, no lazy-loading of its own.
 * `DevBar` renders this behind an `isDev` check and `React.lazy`; render
 * it directly if you're already handling both yourself (see `DevBarView`
 * in the package's public API).
 */
export default function DevBarPanel({
  position = "bottom-right",
  icon,
  tools = [],
}: DevBarViewProps) {
  const mountNode = useShadowHost();
  const [expanded, setExpanded] = useState(false);
  const [activeToolId, setActiveToolId] = useState<string | null>(null);

  if (!mountNode) return null;

  const activeTool = tools.find((tool) => tool.id === activeToolId) ?? null;

  const toggleExpanded = () => {
    setExpanded((value) => {
      const next = !value;
      if (!next) setActiveToolId(null);
      return next;
    });
  };

  const handleToolClick = (id: string) => {
    setActiveToolId((current) => (current === id ? null : id));
  };

  return createPortal(
    <div className={`devbar devbar--${position}`}>
      <div className="devbar__bar">
        <button
          type="button"
          className="devbar__toggle"
          aria-expanded={expanded}
          aria-label={expanded ? "Collapse dev bar" : "Expand dev bar"}
          onClick={toggleExpanded}
        >
          {icon ?? <DefaultIcon />}
        </button>
        {expanded &&
          tools.map((tool) => (
            <button
              key={tool.id}
              type="button"
              className={`devbar__tool${activeToolId === tool.id ? " devbar__tool--active" : ""}`}
              aria-pressed={activeToolId === tool.id}
              title={tool.label}
              onClick={() => handleToolClick(tool.id)}
            >
              {tool.icon ?? tool.label.slice(0, 1).toUpperCase()}
            </button>
          ))}
      </div>
      {expanded && activeTool && (
        <section className="devbar__pane" aria-label={activeTool.label}>
          <div className="devbar__pane-header">
            <span>{activeTool.label}</span>
            <button
              type="button"
              className="devbar__pane-close"
              aria-label="Close"
              onClick={() => setActiveToolId(null)}
            >
              ×
            </button>
          </div>
          <Suspense
            fallback={<div className="devbar__pane-body">Loading…</div>}
          >
            <div className="devbar__pane-body">
              <activeTool.component close={() => setActiveToolId(null)} />
            </div>
          </Suspense>
        </section>
      )}
    </div>,
    mountNode,
  );
}

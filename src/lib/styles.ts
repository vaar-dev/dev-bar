// Injected into the dev bar's shadow root, so it never leaks onto the host
// page and the host page's CSS never leaks in.
export const devBarStyles = `
  :host {
    all: initial;
  }

  * {
    box-sizing: border-box;
  }

  .devbar {
    position: fixed;
    z-index: 2147483647;
    display: flex;
    gap: 10px;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    font-size: 13px;
    line-height: 1.5;
    color: #f4f4f5;
    pointer-events: none;
  }

  /* DOM order is always [bar, pane]; flex-direction decides which edge the
     bar stays docked to while the pane grows away from that edge. */
  .devbar--bottom-right {
    right: 16px;
    bottom: 16px;
    align-items: flex-end;
    flex-direction: column-reverse;
  }

  .devbar--bottom-left {
    left: 16px;
    bottom: 16px;
    align-items: flex-start;
    flex-direction: column-reverse;
  }

  .devbar--bottom-center {
    left: 50%;
    bottom: 16px;
    align-items: center;
    flex-direction: column-reverse;
    transform: translateX(-50%);
  }

  .devbar--top-right {
    right: 16px;
    top: 16px;
    align-items: flex-end;
    flex-direction: column;
  }

  .devbar--top-left {
    left: 16px;
    top: 16px;
    align-items: flex-start;
    flex-direction: column;
  }

  .devbar--top-center {
    left: 50%;
    top: 16px;
    align-items: center;
    flex-direction: column;
    transform: translateX(-50%);
  }

  .devbar__bar {
    pointer-events: auto;
    display: flex;
    align-items: center;
    gap: 6px;
    background: #18181b;
    border: 1px solid #3f3f46;
    border-radius: 12px;
    padding: 6px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.45);
  }

  /* The toggle button is always the first DOM child so it can stay
     anchored to the docked edge: on the right side the bar's row is
     reversed so tool buttons open to its left instead of pushing it
     away from the corner. */
  .devbar--bottom-right .devbar__bar,
  .devbar--top-right .devbar__bar {
    flex-direction: row-reverse;
  }

  .devbar__toggle,
  .devbar__tool {
    appearance: none;
    border: none;
    background: transparent;
    color: #a1a1aa;
    width: 36px;
    height: 36px;
    flex-shrink: 0;
    border-radius: 9px;
    display: flex;
    align-items: center;
    justify-content: center;
    font: inherit;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.1s ease, color 0.1s ease;
  }

  /* Kept visually distinct (a persistent tint) from the tool buttons, so
     the fixed anchor point of the bar is always easy to pick out. */
  .devbar__toggle {
    background: #27272a;
    color: #f4f4f5;
  }

  .devbar__toggle:hover {
    background: #3f3f46;
  }

  .devbar__tool:hover {
    background: #27272a;
    color: #f4f4f5;
  }

  .devbar__tool--active {
    background: #0c4a6e;
    color: #7dd3fc;
  }

  .devbar__tool--active:hover {
    background: #0c4a6e;
    color: #bae6fd;
  }

  .devbar__pane {
    pointer-events: auto;
    width: 300px;
    max-width: calc(100vw - 32px);
    max-height: 60vh;
    overflow: auto;
    border: 1px solid #3f3f46;
    border-radius: 12px;
    background: #18181b;
    box-shadow: 0 8px 28px rgba(0, 0, 0, 0.5);
  }

  .devbar__pane-header {
    position: sticky;
    top: 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 10px 12px;
    border-bottom: 1px solid #27272a;
    background: #18181b;
    font-weight: 600;
    font-size: 12px;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: #a1a1aa;
  }

  .devbar__pane-close {
    appearance: none;
    border: none;
    background: transparent;
    color: #a1a1aa;
    width: 22px;
    height: 22px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 15px;
    line-height: 1;
    border-radius: 6px;
    cursor: pointer;
  }

  .devbar__pane-close:hover {
    background: #27272a;
    color: #f4f4f5;
  }

  .devbar__pane-body {
    padding: 14px;
    font-size: 13px;
    line-height: 1.6;
    color: #e4e4e7;
  }

  /* Sane defaults for common elements plugin authors render inside a
     pane, so a tool doesn't need to hand-roll its own reset just to
     look at home next to the rest of the bar. */
  .devbar__pane-body dl,
  .devbar__pane-body dt,
  .devbar__pane-body dd,
  .devbar__pane-body p {
    margin: 0;
  }

  .devbar__pane-body dt {
    margin-top: 10px;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: #a1a1aa;
  }

  .devbar__pane-body dt:first-child {
    margin-top: 0;
  }

  .devbar__pane-body dd {
    margin-top: 2px;
  }

  .devbar__pane-body button {
    appearance: none;
    font: inherit;
    border: 1px solid #3f3f46;
    background: #27272a;
    color: #f4f4f5;
    padding: 7px 12px;
    border-radius: 8px;
    cursor: pointer;
  }

  .devbar__pane-body button:hover {
    background: #3f3f46;
  }
`;

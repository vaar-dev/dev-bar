import { useState } from "react";

// In its own module and lazy-imported from DemoApp.tsx so this tool's code
// lives in a separate chunk - only fetched the first time its pane opens.
const BACKGROUND_PRESETS = [
  { label: "Default", value: "" },
  { label: "White", value: "#ffffff" },
  { label: "Black", value: "#000000" },
  { label: "Navy", value: "#0f172a" },
  { label: "Hot pink", value: "#ec4899" },
  { label: "Lime", value: "#a3e635" },
];

export default function BackgroundTool() {
  const [selected, setSelected] = useState(BACKGROUND_PRESETS[0].label);

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
      {BACKGROUND_PRESETS.map((preset) => (
        <button
          key={preset.label}
          type="button"
          onClick={() => {
            const center = document.getElementById("center");
            if (center) center.style.background = preset.value;
            setSelected(preset.label);
          }}
          style={{
            outline:
              selected === preset.label ? "2px solid #38bdf8" : undefined,
          }}
        >
          {preset.label}
        </button>
      ))}
    </div>
  );
}

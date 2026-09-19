import { lazy, Suspense } from "react";
import "./DemoApp.css";

// This app decides what "dev" means for itself - Vite's own DEV flag here.
// See the README for the pattern this follows (and how to vary it, e.g.
// across multiple pre-production environments).
const IS_DEV = import.meta.env.DEV;

// The dev bar owns none of the code-splitting itself here - this app
// decides when to fetch it, via its own lazy() + Suspense + isDev gate.
const DevBarSetup = lazy(() => import("./devbar-setup"));

function DemoApp() {
  return (
    <>
      {IS_DEV && (
        <Suspense fallback={null}>
          <DevBarSetup />
        </Suspense>
      )}

      <section id="center">
        <h1>Demo</h1>
      </section>
    </>
  );
}

export default DemoApp;

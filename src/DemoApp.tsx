import { lazy, Suspense } from "react";
import { isDevEnvironment } from "./lib";
import "./DemoApp.css";

// The dev bar owns none of the code-splitting itself here - this app
// decides when to fetch it, via its own lazy() + Suspense + isDev gate.
const DevBarSetup = lazy(() => import("./devbar-setup"));

function DemoApp() {
  return (
    <>
      {isDevEnvironment() && (
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

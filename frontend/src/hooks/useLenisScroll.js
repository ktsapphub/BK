import { useEffect } from "react";

// Native scroll is used site-wide (see lenisSingleton.js for rationale).
// This hook is kept as a no-op entry point in case a future subtle-inertia
// enhancement is reintroduced, without needing to touch call sites.
export function useLenisScroll(_enabled = true) {
  useEffect(() => {}, []);
  return null;
}
